<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeMongoMigration extends Command
{
    protected $signature = 'app:mongo-make {collection : Collection name} {--force : Overwrite the JSON file if it already exists}';

    protected $description = 'Create a MongoDB migration spec JSON file in database/mongomigrations';

    public function handle(): int
    {
        $collection = Str::snake(trim((string) $this->argument('collection')));

        if ($collection === '') {
            $this->error('Collection name cannot be empty.');

            return self::FAILURE;
        }

        $directory = database_path('mongomigrations');

        if (! File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true);
            $this->info("Created directory: {$directory}");
        }

        $path = $directory.DIRECTORY_SEPARATOR.$collection.'.json';

        if (File::exists($path) && ! $this->option('force')) {
            $this->error("File already exists: {$path}");
            $this->line('Use --force to overwrite it.');

            return self::FAILURE;
        }

        $template = [
            'collection' => $collection,
            'validator' => null,
            'validationLevel' => null,
            'validationAction' => null,
            'indexes' => [],
            'documents' => [],
        ];

        File::put(
            $path,
            json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL
        );

        $this->info("Created Mongo migration spec: {$path}");

        return self::SUCCESS;
    }
}
