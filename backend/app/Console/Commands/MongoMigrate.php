<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use JsonException;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Database;
use Symfony\Component\Finder\SplFileInfo;
use Throwable;

class MongoMigrate extends Command
{
    protected $signature = 'app:mongo-migrate
        {collection? : Optional collection name or JSON filename}
        {--schema-only : Apply collection, validator, and index changes only}
        {--seed-only : Apply document inserts/upserts only}';

    protected $description = 'Apply MongoDB collection specs from database/mongomigrations';

    public function handle(): int
    {
        if ($this->option('schema-only') && $this->option('seed-only')) {
            $this->error('Use either --schema-only or --seed-only, not both.');

            return self::FAILURE;
        }

        $specPath = database_path('mongomigrations');

        if (! File::isDirectory($specPath)) {
            $this->error("Mongo migration directory not found: {$specPath}");

            return self::FAILURE;
        }

        try {
            $files = $this->resolveFiles($specPath, $this->argument('collection'));
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        if ($files === []) {
            $this->warn('No Mongo migration JSON files found.');

            return self::SUCCESS;
        }

        /** @var \MongoDB\Laravel\Connection $connection */
        $connection = DB::connection('mongodb');

        /** @var Database $database */
        $database = $connection->getMongoDB();

        $collectionNames = iterator_to_array($database->listCollectionNames());

        foreach ($files as $file) {
            try {
                $spec = $this->readSpec($file);
                $collectionNames = $this->applySpec(
                    $database,
                    $spec,
                    $collectionNames,
                    $file,
                    (bool) $this->option('schema-only'),
                    (bool) $this->option('seed-only')
                );
            } catch (Throwable $exception) {
                $this->error("Failed processing {$file->getFilename()}: {$exception->getMessage()}");

                return self::FAILURE;
            }
        }

        $this->info('Mongo migrations completed.');

        return self::SUCCESS;
    }

    /**
     * @return array<int, SplFileInfo>
     */
    protected function resolveFiles(string $specPath, ?string $selection): array
    {
        $files = collect(File::files($specPath))
            ->filter(static fn (SplFileInfo $file): bool => $file->getExtension() === 'json')
            ->sortBy(static fn (SplFileInfo $file): string => $file->getFilename())
            ->values();

        if ($selection === null) {
            /** @var array<int, SplFileInfo> $allFiles */
            $allFiles = $files->all();

            return $allFiles;
        }

        $normalizedSelection = str_ends_with($selection, '.json') ? $selection : "{$selection}.json";

        /** @var SplFileInfo|null $match */
        $match = $files->first(
            static fn (SplFileInfo $file): bool => $file->getFilename() === $normalizedSelection
            || pathinfo($file->getFilename(), PATHINFO_FILENAME) === $selection
        );

        if ($match === null) {
            throw new \RuntimeException("Mongo migration spec not found for [{$selection}]");
        }

        return [$match];
    }

    /**
     * @return array<string, mixed>
     */
    protected function readSpec(SplFileInfo $file): array
    {
        try {
            $contents = File::get($file->getPathname());
            $spec = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new \RuntimeException("Invalid JSON in {$file->getFilename()}", 0, $exception);
        }

        if (! is_array($spec)) {
            throw new \RuntimeException("Spec in {$file->getFilename()} must decode to an object.");
        }

        $collection = $spec['collection'] ?? null;

        if (! is_string($collection) || trim($collection) === '') {
            throw new \RuntimeException("Spec {$file->getFilename()} must contain a non-empty [collection] string.");
        }

        $indexes = $spec['indexes'] ?? [];
        $documents = $spec['documents'] ?? [];

        if (! is_array($indexes)) {
            throw new \RuntimeException("Spec {$file->getFilename()} must contain an [indexes] array.");
        }

        if (! is_array($documents)) {
            throw new \RuntimeException("Spec {$file->getFilename()} must contain a [documents] array.");
        }

        return $spec;
    }

    /**
     * @param  array<string, mixed>  $spec
     * @param  array<int, string>  $collectionNames
     * @return array<int, string>
     */
    protected function applySpec(
        Database $database,
        array $spec,
        array $collectionNames,
        SplFileInfo $file,
        bool $schemaOnly,
        bool $seedOnly
    ): array {
        $collectionName = $spec['collection'];
        $validator = $spec['validator'] ?? null;
        $validationLevel = $spec['validationLevel'] ?? null;
        $validationAction = $spec['validationAction'] ?? null;

        $createOptions = [];

        if (is_array($validator) && $validator !== []) {
            $createOptions['validator'] = $validator;
        }

        if (is_string($validationLevel) && $validationLevel !== '') {
            $createOptions['validationLevel'] = $validationLevel;
        }

        if (is_string($validationAction) && $validationAction !== '') {
            $createOptions['validationAction'] = $validationAction;
        }

        if (! $seedOnly) {
            if (! in_array($collectionName, $collectionNames, true)) {
                $database->createCollection($collectionName, $createOptions);
                $collectionNames[] = $collectionName;
                $this->info("Created collection: {$collectionName}");
            } else {
                $this->line("Collection already exists: {$collectionName}");

                if ($createOptions !== []) {
                    $database->command(array_merge(
                        ['collMod' => $collectionName],
                        $createOptions
                    ));

                    $this->line("Updated validator/options: {$collectionName}");
                }
            }
        }

        $collection = $database->selectCollection($collectionName);

        if (! $seedOnly) {
            foreach ($spec['indexes'] as $index) {
                if (! is_array($index) || ! isset($index['keys']) || ! is_array($index['keys'])) {
                    throw new \RuntimeException("Each index in {$file->getFilename()} must contain a [keys] object.");
                }

                $options = $index['options'] ?? [];

                if (! is_array($options)) {
                    throw new \RuntimeException("Index options in {$file->getFilename()} must be an object.");
                }

                $indexName = is_string($options['name'] ?? null) ? $options['name'] : json_encode($index['keys']);

                $collection->createIndex($index['keys'], $options);
                $this->line("Applied index {$indexName} on {$collectionName}");
            }
        }

        if (! $schemaOnly) {
            foreach ($spec['documents'] ?? [] as $position => $documentSpec) {
                $this->applyDocument($collection, $collectionName, $documentSpec, $file, $position);
            }
        }

        return $collectionNames;
    }

    /**
     * @param  mixed  $documentSpec
     */
    protected function applyDocument($collection, string $collectionName, $documentSpec, SplFileInfo $file, int $position): void
    {
        if (! is_array($documentSpec)) {
            throw new \RuntimeException("Document entry #{$position} in {$file->getFilename()} must be an object.");
        }

        $documentNumber = $position + 1;
        $isOperation = array_key_exists('data', $documentSpec) || array_key_exists('filter', $documentSpec);

        if ($isOperation) {
            $data = $documentSpec['data'] ?? null;
            $filter = $documentSpec['filter'] ?? null;
            $upsert = (bool) ($documentSpec['upsert'] ?? true);

            if (! is_array($data) || $data === []) {
                throw new \RuntimeException("Document operation #{$documentNumber} in {$file->getFilename()} must contain a non-empty [data] object.");
            }

            if ($filter !== null && (! is_array($filter) || $filter === [])) {
                throw new \RuntimeException("Document operation #{$documentNumber} in {$file->getFilename()} must use a non-empty [filter] object.");
            }

            if ($filter === null) {
                $data = $this->normalizeValue($data);

                if (array_key_exists('_id', $data)) {
                    $filter = ['_id' => $data['_id']];
                } else {
                    $collection->insertOne($data);
                    $this->line("Inserted document #{$documentNumber} into {$collectionName}");

                    return;
                }
            }

            $filter = $this->normalizeValue($filter);
            $data = $this->normalizeValue($data);
            $collection->replaceOne($filter, $data, ['upsert' => $upsert]);
            $this->line("Upserted document #{$documentNumber} into {$collectionName}");

            return;
        }

        if ($documentSpec === []) {
            throw new \RuntimeException("Document entry #{$documentNumber} in {$file->getFilename()} cannot be empty.");
        }

        $documentSpec = $this->normalizeValue($documentSpec);

        if (array_key_exists('_id', $documentSpec)) {
            $collection->replaceOne(['_id' => $documentSpec['_id']], $documentSpec, ['upsert' => true]);
            $this->line("Upserted document #{$documentNumber} into {$collectionName}");

            return;
        }

        $collection->insertOne($documentSpec);
        $this->line("Inserted document #{$documentNumber} into {$collectionName}");
    }

    /**
     * @param  mixed  $value
     * @return mixed
     */
    protected function normalizeValue($value)
    {
        if (! is_array($value)) {
            return $value;
        }

        if (array_key_exists('$date', $value) && count($value) === 1 && is_string($value['$date'])) {
            $dateTime = new \DateTimeImmutable($value['$date']);
            $milliseconds = ((int) $dateTime->format('U')) * 1000 + intdiv((int) $dateTime->format('u'), 1000);

            return new UTCDateTime($milliseconds);
        }

        if (array_key_exists('$oid', $value) && count($value) === 1 && is_string($value['$oid'])) {
            return new ObjectId($value['$oid']);
        }

        foreach ($value as $key => $item) {
            $value[$key] = $this->normalizeValue($item);
        }

        return $value;
    }
}
