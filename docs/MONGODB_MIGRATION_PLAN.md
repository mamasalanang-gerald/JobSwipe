# MongoDB Migration Plan

## Goal

Add a repeatable, migration-like setup for MongoDB collections and indexes in the Laravel backend.

This repo already uses SQL migrations for PostgreSQL. MongoDB works differently: collections are often created on first write, so there is no built-in Laravel flow here that will automatically create Mongo collections from files in `app/Models/MongoDB`.

The clean equivalent is a custom Artisan command that:

1. Connects to the `mongodb` connection.
2. Creates the target collection if it does not exist.
3. Creates the indexes needed by the application.
4. Can be re-run safely.

## Sample Command

Create a command such as `app:mongodb-migrate` in `backend/app/Console/Commands/MongoMigrate.php`.

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use MongoDB\Database;

class MongoMigrate extends Command
{
    protected $signature = 'app:mongodb-migrate';

    protected $description = 'Create MongoDB collections and indexes';

    public function handle(): int
    {
        /** @var \MongoDB\Laravel\Connection $connection */
        $connection = DB::connection('mongodb');

        /** @var Database $database */
        $database = $connection->getMongoDB();

        $collectionName = 'swipe_history';

        $existingCollections = iterator_to_array($database->listCollectionNames());

        if (! in_array($collectionName, $existingCollections, true)) {
            $database->createCollection($collectionName);
            $this->info("Created collection: {$collectionName}");
        } else {
            $this->line("Collection already exists: {$collectionName}");
        }

        $collection = $database->selectCollection($collectionName);

        $collection->createIndex(
            ['user_id' => 1, 'swiped_at' => -1],
            ['name' => 'idx_user_swiped_at']
        );

        $collection->createIndex(
            ['target_id' => 1, 'direction' => 1],
            ['name' => 'idx_target_direction']
        );

        $this->info('MongoDB migration completed.');

        return self::SUCCESS;
    }
}
```

## How It Works

- `DB::connection('mongodb')` uses the MongoDB connection defined in `backend/config/database.php`.
- That connection writes to the database named by `MONGO_DATABASE`.
- In your current Docker setup, that is `jobapp`.
- The command explicitly creates the collection and its indexes inside that MongoDB database.

## Run It

```bash
cd backend
php artisan app:mongodb-migrate
```

## Implementation Plan

1. Add a new command class at `backend/app/Console/Commands/MongoMigrate.php`.
2. Keep all collection creation logic inside that command so Mongo setup stays separate from PostgreSQL migrations.
3. Define collections explicitly with `createCollection()` only when they do not already exist.
4. Create indexes in the same command so every environment gets the same lookup performance and uniqueness rules.
5. Run the command after your normal environment boot step, alongside `php artisan migrate`.
6. If Mongo setup grows, split the logic into separate classes such as `backend/app/MongoMigrations/CreateSwipeHistory.php`.

## Notes

- This is not a replacement for SQL migrations. It is a parallel setup path for MongoDB.
- MongoDB can still auto-create collections on first write, but explicit creation is better when you need predictable indexes.
- If you want rollback behavior later, add a companion command such as `app:mongodb-rollback` that drops indexes or collections deliberately.
