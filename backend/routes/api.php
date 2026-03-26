<?php

use App\Http\Controllers\Applicant\SwipeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Company\JobPostingController;
use App\Http\Middleware\CheckSwipeLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/health', function (Request $request) {
    return ['status' => 'ok', 'timestamp' => now()];
});

// Clear cache endpoint (for free tier without shell access)
Route::get('/clear-cache', function () {
    try {
        \Artisan::call('route:clear');
        \Artisan::call('config:clear');
        \Artisan::call('cache:clear');

        return response()->json([
            'status' => 'success',
            'message' => 'Cache cleared. Routes should be available now.',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// Debug endpoint to check email and queue configuration
Route::get('/debug/email-config', function () {
    try {
        $config = [
            'mail' => [
                'default_mailer' => config('mail.default'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name'),
                'smtp_host' => config('mail.mailers.smtp.host'),
                'smtp_port' => config('mail.mailers.smtp.port'),
                'smtp_username' => config('mail.mailers.smtp.username') ? 'SET' : 'NOT SET',
                'smtp_password' => config('mail.mailers.smtp.password') ? 'SET' : 'NOT SET',
                'smtp_encryption' => config('mail.mailers.smtp.encryption'),
            ],
            'queue' => [
                'default_connection' => config('queue.default'),
                'redis_connection' => config('queue.connections.redis.connection'),
                'redis_queue' => config('queue.connections.redis.queue'),
            ],
            'redis' => [
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port'),
                'password' => config('database.redis.default.password') ? 'SET' : 'NOT SET',
            ],
            'horizon' => [
                'use' => config('horizon.use'),
                'prefix' => config('horizon.prefix'),
            ],
        ];

        // Test Redis connection
        try {
            Redis::ping();
            $config['redis']['status'] = 'CONNECTED';
        } catch (\Exception $e) {
            $config['redis']['status'] = 'ERROR: '.$e->getMessage();
        }

        // Check pending jobs
        try {
            $pendingJobs = Redis::llen('queues:default');
            $config['queue']['pending_jobs'] = $pendingJobs;
        } catch (\Exception $e) {
            $config['queue']['pending_jobs'] = 'ERROR: '.$e->getMessage();
        }

        return response()->json([
            'status' => 'success',
            'config' => $config,
            'env_check' => [
                'QUEUE_CONNECTION' => env('QUEUE_CONNECTION'),
                'MAIL_MAILER' => env('MAIL_MAILER'),
                'MAIL_HOST' => env('MAIL_HOST'),
                'REDIS_HOST' => env('REDIS_HOST'),
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

// Debug endpoint to test email sending
Route::post('/debug/test-email', function (Request $request) {
    try {
        $email = $request->input('email', 'test@example.com');

        \Log::info('Debug: Testing email send', ['email' => $email]);

        // Try to queue an email
        \Illuminate\Support\Facades\Mail::to($email)->queue(
            new \App\Mail\EmailVerificationMail('123456')
        );

        \Log::info('Debug: Email queued successfully', ['email' => $email]);

        return response()->json([
            'status' => 'success',
            'message' => 'Email queued. Check Horizon logs for processing.',
            'email' => $email,
        ]);
    } catch (\Exception $e) {
        \Log::error('Debug: Email test failed', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
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

        // ── Company Job Management (Phase 2) ──────────────────────
        Route::prefix('company')->group(function () {
            Route::apiResource('jobs', JobPostingController::class);
            Route::post('jobs/{id}/close', [JobPostingController::class, 'close']);
            // Applicant Swipe Routes
            Route::prefix('applicant/swipe')->group(function () {
                Route::get('deck', [SwipeController::class, 'getDeck']);
                Route::get('limits', [SwipeController::class, 'getLimits']);

                // Swipe actions require limit check
                Route::middleware(CheckSwipeLimit::class)->group(function () {
                    Route::post('right/{job_id}', [SwipeController::class, 'swipeRight']);
                    Route::post('left/{job_id}', [SwipeController::class, 'swipeLeft']);
                });
            });
        });
    });
});
