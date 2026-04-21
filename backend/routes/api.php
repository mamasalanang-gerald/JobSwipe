<?php

use App\Http\Controllers\Admin\AdminCompanyVerificationController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminUserController;
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
use App\Http\Controllers\Review\ReviewController;
use App\Http\Controllers\Subscription\SubscriptionController;
use App\Http\Controllers\Webhook\AppleWebhookController;
use App\Http\Controllers\Webhook\GoogleWebhookController;
use Illuminate\Http\Request;
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

    Route::prefix('v1')->group(function () {
        Route::post('auth/register', [AuthController::class, 'register']);
        Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:3,1');
        Route::post('auth/resend-verification', [AuthController::class, 'resendVerification']);

        Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

        Route::get('auth/google/redirect', [OAuthController::class, 'redirectToGoogle']);
        Route::get('auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

        // Public company invite validation (for registration flow)
        Route::post('company/invites/validate', [\App\Http\Controllers\Company\CompanyInviteController::class, 'validate']);

        Route::post('webhooks/stripe', [SubscriptionController::class, 'handleWebhook']);
        Route::post('webhooks/apple-iap', [AppleWebhookController::class, 'handleNotification']);
        Route::post('webhooks/google-play', [GoogleWebhookController::class, 'handleNotification']);

        Route::middleware('auth:sanctum', 'verified')->group(function () {
            Route::post('auth/logout', [AuthController::class, 'logout']);
            Route::get('auth/me', [AuthController::class, 'me']);

            Route::prefix('files')->group(function () {
                Route::post('upload-url', [FileUploadController::class, 'generateUploadUrl']);
                Route::post('read-url', [FileUploadController::class, 'generateReadUrl']);
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
                Route::post('jobs/{id}/restore', [JobPostingController::class, 'restore']);

                Route::prefix('jobs/{jobId}/applicants')->group(function () {
                    Route::get('/', [ApplicantReviewController::class, 'getApplicants']);
                    Route::get('{applicantId}', [ApplicantReviewController::class, 'getApplicantDetail']);
                    Route::post('{applicantId}/right', [ApplicantReviewController::class, 'swipeRight']);
                    Route::post('{applicantId}/left', [ApplicantReviewController::class, 'swipeLeft']);
                });

                // Company invites (admin only)
                Route::middleware('role:company_admin')->prefix('invites')->group(function () {
                    Route::post('/', [\App\Http\Controllers\Company\CompanyInviteController::class, 'store']);
                    Route::post('bulk', [\App\Http\Controllers\Company\CompanyInviteController::class, 'bulkStore']);
                    Route::get('/', [\App\Http\Controllers\Company\CompanyInviteController::class, 'index']);
                    Route::delete('{inviteId}', [\App\Http\Controllers\Company\CompanyInviteController::class, 'destroy']);
                    Route::post('{inviteId}/resend', [\App\Http\Controllers\Company\CompanyInviteController::class, 'resend']);
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
                Route::post('/', [MatchMessageController::class, 'store'])->middleware('throttle:match-messages-send');
                Route::post('typing', [MatchMessageController::class, 'typing'])->middleware('throttle:match-messages-typing');
                Route::patch('read', [MatchMessageController::class, 'markAsRead'])->middleware('throttle:match-messages-read');
            });

            // ── Company Reviews ───────────────────────────────────────────────
            Route::prefix('reviews')->group(function () {
                Route::middleware('role:applicant')->post('/', [ReviewController::class, 'store']);
                Route::get('company/{companyId}', [ReviewController::class, 'index']);
                Route::post('{id}/flag', [ReviewController::class, 'flag']);
            });

            // ── Admin Review Moderation ───────────────────────────────────────
            Route::middleware('role:moderator,super_admin')->prefix('admin/reviews')->group(function () {
                Route::get('flagged', [AdminReviewController::class, 'getFlaggedReviews']);
                Route::post('{id}/unflag', [AdminReviewController::class, 'unflag']);
                Route::delete('{id}', [AdminReviewController::class, 'remove']);
            });

            // ── Admin Job Posting Management ──────────────────────────────────
            Route::middleware('role:moderator,super_admin')->prefix('admin/jobs')->group(function () {
                Route::delete('{id}/force', [JobPostingController::class, 'forceDestroy']);
                // ── Admin: Verification, User lookup, Dashboard (moderator + super_admin) ──
                Route::middleware('role:moderator,super_admin')->prefix('admin')->group(function () {
                    Route::get('dashboard/stats', [AdminDashboardController::class, 'stats']);

                    Route::prefix('companies/verifications')->group(function () {
                        Route::get('/', [AdminCompanyVerificationController::class, 'index']);
                        Route::get('{companyId}', [AdminCompanyVerificationController::class, 'show']);
                        Route::post('{companyId}/approve', [AdminCompanyVerificationController::class, 'approve']);
                        Route::post('{companyId}/reject', [AdminCompanyVerificationController::class, 'reject']);
                    });

                    Route::get('users', [AdminUserController::class, 'index']);
                    Route::get('users/{id}', [AdminUserController::class, 'show']);
                });

                // ── Admin: Destructive user actions (super_admin only) ────────────
                Route::middleware('role:super_admin')->prefix('admin')->group(function () {
                    Route::post('users/{id}/ban', [AdminUserController::class, 'ban']);
                    Route::post('users/{id}/unban', [AdminUserController::class, 'unban']);
                });
            });
        });
    });
});
