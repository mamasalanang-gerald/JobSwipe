<?php

use App\Http\Controllers\Applicant\SwipeController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Middleware\CheckSwipeLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (Request $request) {
    return ['status' => 'ok', 'timestamp' => now()];
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
