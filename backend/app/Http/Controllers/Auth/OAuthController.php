<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    /**
     * Redirect the user to Google's auth page.
     * The frontend calls this endpoint and then opens the returned URL.
     * For mobile (Expo), the deep link handling is done client-side.
     */
    public function redirectToGoogle(): JsonResponse
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();

        return $this->success(data: ['redirect_url' => $url]);
    }

    public function handleGoogleCallback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return $this->error(
                code: 'OAUTH_FAILED',
                message: 'Google authentication failed. Please try again.',
                status: 422
            );
        }

        $result = $this->auth->handleGoogleCallback($googleUser);

        if ($result['status'] === 'banned') {
            return $this->error(
                code: 'ACCOUNT_BANNED',
                message: 'Your account has been suspended.',
                status: 403
            );
        }

        if ($result['status'] === 'role_not_allowed') {
            return $this->error(
                code: 'OAUTH_NOT_PERMITTED',
                message: 'Google OAuth is only available for applicant accounts.',
                status: 403
            );
        }

        return $this->success(
            data: [
                'token' => $result['token'],
                'user' => $result['user'],
                'is_new_user' => $result['is_new_user'],
            ],
            message: $result['is_new_user']
                ? 'Account created via Google. Please complete your profile.'
                : 'Logged in with Google.',
        );
    }
}
