<?php

use App\Http\Controllers\Applicant\SwipeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Company\ApplicantReviewController;
use App\Http\Controllers\Company\JobPostingController;
use App\Http\Controllers\File\FileUploadController;
use App\Http\Controllers\Notification\NotificationController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Mail\EmailVerificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

<<<<<<< HEAD
Route::middleware('throttle:api-tiered')->group(function () {
    Route::get('/health', function (Request $request) {
        return ['status' => 'ok', 'timestamp' => now()];
    });
=======
Route::get('/health', function (Request $request) {
    return ['status' => 'ok', 'timestamp' => now()];
});

// Clear cache endpoint (for free tier without shell access)
Route::get('/clear-cache', function () {
    try {
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');

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

        Log::info('Debug: Testing email send', ['email' => $email]);

        // Try to queue an email
        Mail::to($email)->queue(
            new EmailVerificationMail('123456')
        );

        Log::info('Debug: Email queued successfully', ['email' => $email]);

        return response()->json([
            'status' => 'success',
            'message' => 'Email queued. Check Horizon logs for processing.',
            'email' => $email,
        ]);
    } catch (\Exception $e) {
        Log::error('Debug: Email test failed', [
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
>>>>>>> 61bd784a31472e0ab9cc82c3b8a6d171fea95ebc

    // Clear cache endpoint (for free tier without shell access)
    Route::get('/clear-cache', function () {
        try {
            Artisan::call('route:clear');
            Artisan::call('config:clear');
            Artisan::call('cache:clear');

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

<<<<<<< HEAD
            // Check pending jobs
            try {
                $pendingJobs = Redis::llen('queues:default');
                $config['queue']['pending_jobs'] = $pendingJobs;
            } catch (\Exception $e) {
                $config['queue']['pending_jobs'] = 'ERROR: '.$e->getMessage();
            }
=======
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
    Route::get('auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);
>>>>>>> 61bd784a31472e0ab9cc82c3b8a6d171fea95ebc

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

<<<<<<< HEAD
    // Debug endpoint to test email sending
    Route::post('/debug/test-email', function (Request $request) {
        try {
            $email = $request->input('email', 'test@example.com');

            Log::info('Debug: Testing email send', ['email' => $email]);
=======
    Route::middleware('auth:sanctum', 'verified')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::prefix('files')->group(function () {
            Route::post('upload-url', [FileUploadController::class, 'generateUploadUrl']);
            Route::post('confirm-upload', [FileUploadController::class, 'confirmUpload']);
        });
>>>>>>> 61bd784a31472e0ab9cc82c3b8a6d171fea95ebc

            // Try to queue an email
            Mail::to($email)->queue(
                new EmailVerificationMail('123456')
            );

            Log::info('Debug: Email queued successfully', ['email' => $email]);

            return response()->json([
                'status' => 'success',
                'message' => 'Email queued. Check Horizon logs for processing.',
                'email' => $email,
            ]);
        } catch (\Exception $e) {
            Log::error('Debug: Email test failed', [
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

        Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

        Route::get('auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
        Route::get('auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

        Route::post('webhooks/stripe', [SubscriptionController::class, 'handleWebhook']);

        Route::middleware('auth:sanctum', 'verified')->group(function () {
            Route::post('auth/logout', [AuthController::class, 'logout']);
            Route::get('auth/me', [AuthController::class, 'me']);

            Route::prefix('files')->group(function () {
                Route::post('upload-url', [FileUploadController::class, 'generateUploadUrl']);
                Route::post('confirm-upload', [FileUploadController::class, 'confirmUpload']);
            });

            Route::prefix('notifications')->group(function () {
                Route::get('/', [NotificationController::class, 'index']);
                Route::get('/unread', [NotificationController::class, 'unread']);
                Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
                Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
                Route::get('/preferences', [NotificationController::class, 'getPreferences']);
                Route::patch('/preferences', [NotificationController::class, 'updatePreferences']);
            });

            Route::prefix('profile')->group(function () {
                Route::middleware('role:applicant')->prefix('applicant')->group(function () {
                    Route::get('/', [ProfileController::class, 'getApplicantProfile']);
                    Route::patch('basic-info', [ProfileController::class, 'updateApplicantBasicInfo']);
                    Route::patch('skills', [ProfileController::class, 'updateApplicantSkills']);
                    Route::post('experience', [ProfileController::class, 'addWorkExperience']);
                    Route::patch('experience/{index}', [ProfileController::class, 'updateWorkExperience']);
                    Route::delete('experience/{index}', [ProfileController::class, 'removeWorkExperience']);
                    Route::post('education', [ProfileController::class, 'addEducation']);
                    Route::patch('education/{index}', [ProfileController::class, 'updateEducation']);
                    Route::delete('education/{index}', [ProfileController::class, 'removeEducation']);
                    Route::patch('resume', [ProfileController::class, 'updateApplicantResume']);
                    Route::patch('cover-letter', [ProfileController::class, 'updateApplicantCoverLetter']);
                    Route::patch('photo', [ProfileController::class, 'updateApplicantPhoto']);
                    Route::patch('social-links', [ProfileController::class, 'updateSocialLinks']);
                });

                Route::middleware('role:hr,company_admin')->prefix('company')->group(function () {
                    Route::get('/', [ProfileController::class, 'getCompanyProfile']);
                    Route::patch('details', [ProfileController::class, 'updateCompanyDetails']);
                    Route::patch('logo', [ProfileController::class, 'updateCompanyLogo']);
                    Route::post('office-images', [ProfileController::class, 'addOfficeImage']);
                    Route::delete('office-images/{index}', [ProfileController::class, 'removeOfficeImage']);
                });

                Route::middleware('role:company_admin')->prefix('company')->group(function () {
                    Route::post('verification', [ProfileController::class, 'submitVerificationDocuments']);
                });

                Route::get('onboarding/status', [ProfileController::class, 'getOnboardingStatus']);
                Route::post('onboarding/complete-step', [ProfileController::class, 'completeOnboardingStep']);
                Route::get('completion', [ProfileController::class, 'getProfileCompletion']);
            });

            Route::prefix('subscriptions')->group(function () {
                Route::middleware('role:hr,company_admin')->post('checkout', [SubscriptionController::class, 'createCheckoutSession']);
                Route::middleware('role:hr,company_admin')->get('status', [SubscriptionController::class, 'getSubscriptionStatus']);
                Route::middleware('role:company_admin')->post('cancel', [SubscriptionController::class, 'cancelSubscription']);
            });

            Route::middleware('role:hr,company_admin')->prefix('company')->group(function () {
                Route::apiResource('jobs', JobPostingController::class);
                Route::post('jobs/{id}/close', [JobPostingController::class, 'close']);

                Route::prefix('jobs/{jobId}/applicants')->group(function () {
                    Route::get('/', [ApplicantReviewController::class, 'getApplicants']);
                    Route::get('{applicantId}', [ApplicantReviewController::class, 'getApplicantDetail']);
                    Route::post('{applicantId}/right', [ApplicantReviewController::class, 'swipeRight']);
                    Route::post('{applicantId}/left', [ApplicantReviewController::class, 'swipeLeft']);
                });
            });

            Route::middleware('role:applicant')->prefix('applicant/swipe')->group(function () {
                Route::get('deck', [SwipeController::class, 'getDeck']);
                Route::get('limits', [SwipeController::class, 'getLimits']);

<<<<<<< HEAD
                Route::middleware('swipe.limit')->group(function () {
                    Route::post('right/{jobId}', [SwipeController::class, 'swipeRight']);
                    Route::post('left/{jobId}', [SwipeController::class, 'swipeLeft']);
                });
=======
            Route::get('onboarding/status', [ProfileController::class, 'getOnboardingStatus']);
            Route::post('onboarding/complete-step', [ProfileController::class, 'completeOnboardingStep']);
            Route::get('completion', [ProfileController::class, 'getProfileCompletion']);
        });

        Route::prefix('subscriptions')->group(function () {
            Route::middleware('role:hr,company_admin')->post('checkout', [SubscriptionController::class, 'createCheckoutSession']);
            Route::middleware('role:hr,company_admin')->get('status', [SubscriptionController::class, 'getSubscriptionStatus']);
            Route::middleware('role:company_admin')->post('cancel', [SubscriptionController::class, 'cancelSubscription']);
        });

        Route::middleware('role:hr,company_admin')->prefix('company')->group(function () {
            Route::apiResource('jobs', JobPostingController::class);
            Route::post('jobs/{id}/close', [JobPostingController::class, 'close']);

            Route::prefix('jobs/{jobId}/applicants')->group(function () {
                Route::get('/', [ApplicantReviewController::class, 'getApplicants']);
                Route::get('{applicantId}', [ApplicantReviewController::class, 'getApplicantDetail']);
                Route::post('{applicantId}/right', [ApplicantReviewController::class, 'swipeRight']);
                Route::post('{applicantId}/left', [ApplicantReviewController::class, 'swipeLeft']);
            });
        });

        Route::middleware('role:applicant')->prefix('applicant/swipe')->group(function () {
            Route::get('deck', [SwipeController::class, 'getDeck']);
            Route::get('limits', [SwipeController::class, 'getLimits']);

            Route::middleware('swipe.limit')->group(function () {
                Route::post('right/{jobId}', [SwipeController::class, 'swipeRight']);
                Route::post('left/{jobId}', [SwipeController::class, 'swipeLeft']);
>>>>>>> 61bd784a31472e0ab9cc82c3b8a6d171fea95ebc
            });
        });
    });
});
