<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Redis;

Route::get('/health', function (Request $request) {
    return ['status' => 'ok', 'timestamp' => now()];
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

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('auth/resend-verification', [AuthController::class, 'resendVerification']);

    Route::get('auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
    Route::get('auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);
    });
});
