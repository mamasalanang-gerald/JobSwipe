<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Redis;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Debug endpoint to check database and Redis
Route::get('/debug/database', function () {
    try {
        $tables = Schema::getTableListing();
        
        $tableCounts = [];
        foreach ($tables as $table) {
            try {
                $tableCounts[$table] = DB::table($table)->count();
            } catch (\Exception $e) {
                $tableCounts[$table] = 'Error: ' . $e->getMessage();
            }
        }
        
        $redisKeys = [];
        try {
            $redisKeys = Redis::keys('*');
            $redisSize = Redis::dbSize();
        } catch (\Exception $e) {
            $redisKeys = ['Error: ' . $e->getMessage()];
            $redisSize = 0;
        }
        
        return response()->json([
            'status' => 'success',
            'database' => [
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
        ], 500);
    }
});
