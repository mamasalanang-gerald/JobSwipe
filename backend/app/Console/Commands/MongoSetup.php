<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;

class MongoSetup extends Command
{
    protected $signature = 'mongo:setup';
    protected $description = 'Setup MongoDB collections and indexes';

    public function handle(): int
    {
        try {
            $this->info('Setting up MongoDB collections...');

            $client = new Client(
                sprintf(
                    'mongodb://%s:%s@%s:%s/%s?authSource=admin',
                    config('database.connections.mongodb.username'),
                    config('database.connections.mongodb.password'),
                    config('database.connections.mongodb.host'),
                    config('database.connections.mongodb.port'),
                    config('database.connections.mongodb.database')
                )
            );

            $database = $client->selectDatabase(config('database.connections.mongodb.database'));

            // Create collections if they don't exist
            $collections = ['applicant_profiles', 'company_profiles', 'swipe_history'];

            foreach ($collections as $collectionName) {
                try {
                    $database->createCollection($collectionName);
                    $this->info("Created collection: {$collectionName}");
                } catch (\Exception $e) {
                    // Collection might already exist
                    $this->warn("Collection {$collectionName} might already exist");
                }
            }

            // Create indexes
            $this->info('Creating indexes...');

            // Applicant profiles indexes
            $database->applicant_profiles->createIndex(['user_id' => 1], ['unique' => true]);
            $database->applicant_profiles->createIndex(['skills' => 1]);
            $database->applicant_profiles->createIndex(['location' => 1]);

            // Company profiles indexes
            $database->company_profiles->createIndex(['user_id' => 1], ['unique' => true]);
            $database->company_profiles->createIndex(['industry' => 1]);

            // Swipe history indexes
            $database->swipe_history->createIndex(['user_id' => 1]);
            $database->swipe_history->createIndex(['job_id' => 1]);
            $database->swipe_history->createIndex(['created_at' => -1]);

            $this->info('MongoDB setup completed successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('MongoDB setup failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
