<?php

use App\Http\Controllers\Applicant\ApplicationController;
use App\Http\Controllers\Applicant\MatchController as ApplicantMatchController;
use App\Http\Controllers\Applicant\SwipeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Company\ApplicantReviewController;
use App\Http\Controllers\Company\JobPostingController;
use App\Http\Controllers\Company\MatchController as CompanyMatchController;
use App\Http\Controllers\File\FileUploadController;
use App\Http\Controllers\IAP\IAPController;
use App\Http\Controllers\Match\MatchMessageController;
use App\Http\Controllers\Notification\NotificationController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Http\Controllers\Webhook\AppleWebhookController;
use App\Http\Controllers\Webhook\GoogleWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// Health check endpoint - no middleware for CI/CD testing
Route::get('/health', function (Request $request) {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'app' => config('app.name'),
        'env' => config('app.env'),
    ]);
});

Route::middleware('throttle:api-tiered')->group(function () {

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
        Route::post('webhooks/apple-iap', [AppleWebhookController::class, 'handleNotification']);
        Route::post('webhooks/google-play', [GoogleWebhookController::class, 'handleNotification']);

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

            Route::prefix('iap')->group(function () {
                Route::middleware('role:applicant')->post('purchase', [IAPController::class, 'purchase']);
            });

            Route::prefix('applicant')->group(function () {
                Route::middleware('role:applicant')->get('subscription/status', [IAPController::class, 'getSubscriptionStatus']);
                Route::middleware('role:applicant')->get('purchases', [IAPController::class, 'getPurchaseHistory']);
                Route::middleware('role:applicant')->post('subscription/cancel', [IAPController::class, 'cancelSubscription']);
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

            // ── Applicant Applications (§11.3 - previously missing endpoint) ──
            Route::middleware('role:applicant')->prefix('applicant')->group(function () {
                Route::get('applications', [ApplicationController::class, 'index']);
                Route::get('applications/{id}', [ApplicationController::class, 'show']);
            });

            // ── Applicant Matches ─────────────────────────────────────────────
            Route::middleware('role:applicant')->prefix('applicant/matches')->group(function () {
                Route::get('/', [ApplicantMatchController::class, 'index']);
                Route::get('{id}', [ApplicantMatchController::class, 'show']);
                Route::post('{id}/accept', [ApplicantMatchController::class, 'accept']);
                Route::post('{id}/decline', [ApplicantMatchController::class, 'decline']);
            });

            // ── HR/Company Matches ────────────────────────────────────────────
            Route::middleware('role:hr,company_admin')->prefix('company/matches')->group(function () {
                Route::get('/', [CompanyMatchController::class, 'index']);
                Route::get('{id}', [CompanyMatchController::class, 'show']);
                Route::post('{id}/close', [CompanyMatchController::class, 'close']);
            });

            // ── Match Messages (shared by both applicant and HR) ──────────────
            Route::prefix('matches/{matchId}/messages')->group(function () {
                Route::get('/', [MatchMessageController::class, 'index']);
                Route::post('/', [MatchMessageController::class, 'store']);
                Route::post('typing', [MatchMessageController::class, 'typing']);
                Route::patch('read', [MatchMessageController::class, 'markAsRead']);
            });
        });
    });
});
