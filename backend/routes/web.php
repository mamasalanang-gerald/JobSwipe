<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    return ['message' => 'Laravel API is running'];
});

// Debug endpoint to check database and Redis
Route::get('/debug/database', function () {
    try {
        $tables = Schema::getTableListing();

        $tableCounts = [];
        foreach ($tables as $table) {
            try {
                $tableCounts[$table] = DB::table($table)->count();
            } catch (\Exception $e) {
                $tableCounts[$table] = 'Error: '.$e->getMessage();
            }
        }

        $redisKeys = [];
        try {
            $redisKeys = Redis::keys('*');
            $redisSize = Redis::dbSize();
        } catch (\Exception $e) {
            $redisKeys = ['Error: '.$e->getMessage()];
            $redisSize = 0;
        }

        return response()->json([
            'status' => 'success',
            'database' => [
                'connection' => config('database.default'),
                'tables' => $tables,
                'table_counts' => $tableCounts,
            ],
            'redis' => [
                'keys' => $redisKeys,
                'total_keys' => $redisSize,
            ],
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});
