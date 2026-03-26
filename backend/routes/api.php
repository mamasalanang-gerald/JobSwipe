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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/health', function (Request $request) {
    return ['status' => 'ok', 'timestamp' => now()];
});

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

    Route::get('auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
    Route::get('auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

    Route::post('webhooks/stripe', [SubscriptionController::class, 'handleWebhook']);

    Route::middleware('auth:sanctum')->group(function () {
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

            Route::middleware('swipe.limit')->group(function () {
                Route::post('right/{jobId}', [SwipeController::class, 'swipeRight']);
                Route::post('left/{jobId}', [SwipeController::class, 'swipeLeft']);
            });
        });
    });
});
