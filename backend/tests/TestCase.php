<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Flush the cache before each test to clear rate limiters
        // (array cache in unit tests, redis cache in real-backend feature tests)
        Cache::flush();

        if ($this->usesRealBackends()) {
            $this->resetRedis();
            $this->resetMongo();
        }
    }

    private function usesRealBackends(): bool
    {
        return filter_var(env('TEST_USE_REAL_BACKENDS', false), FILTER_VALIDATE_BOOL);
    }

    private function resetRedis(): void
    {
        // Clear both configured Redis DBs used by default and cache connections.
        Redis::connection('default')->flushdb();
        Redis::connection('cache')->flushdb();
    }

    private function resetMongo(): void
    {
        /** @var \MongoDB\Laravel\Connection $connection */
        $connection = DB::connection('mongodb');
        $database = $connection->getMongoDB();

        foreach ($database->listCollections() as $collectionInfo) {
            $name = $collectionInfo->getName();

            // Defensive guard; test DB shouldn't have system collections but skip anyway.
            if (str_starts_with($name, 'system.')) {
                continue;
            }

            $database->dropCollection($name);
        }
    }
}
