<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        if (in_array($request->input('role'), ['hr', 'company_admin'], true) && $request->has('oauth_provider')) {
            return $this->error(
                'OAUTH_NOT_PERMITTED',
                'HR/Company accounts must register with email and password.',
                422
            );
        }

        $result = $this->auth->initiateRegistration(
            email: $request->input('email'),
            password: $request->input('password'),
            role: $request->input('role'),
        );

        if ($result === 'email_taken') {
            return $this->error('EMAIL_TAKEN', 'An account already existed with this email', 409);
        }

        return $this->success(
            data: ['email' => $request->input('email')],
            message: 'Verification code sent successfully'
        );
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $result = $this->auth->completeRegistration(
            email: $request->email,
            code: $request->code,
        );

        return match ($result['status']) {
            'verified' => $this->success(
                data: [
                    'token' => $result['token'],
                    'user' => $result['user'],
                ],
                message: 'Email verified successfully. Account created.',
                status: 201
            ),
            'expired' => $this->error('OTP_EXPIRED', 'Verification code has expired. Please request a new one.', 422),
            'invalid' => $this->error('OTP_INVALID', 'Incorrect verification code.', 422),
            'max_attempts' => $this->error('OTP_MAX_ATTEMPTS', 'Too many incorrect attempts. Please request a new code.', 429),
        };
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $this->auth->resendOtp($request->email);

        // Always return success to prevent email enumeration
        return $this->success(message: 'If that email is registered, a new code has been sent.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->email, $request->password);

        return match ($result['status']) {
            'success' => $this->success(data: [
                'token' => $result['token'],
                'user' => $result['user'],
            ]),
            'invalid_credentials' => $this->error('INVALID_CREDENTIALS', 'Invalid email or password.', 401),
            'unverified' => $this->error('EMAIL_UNVERIFIED', 'Please verify your email. A new code has been sent.', 403),
            'banned' => $this->error('ACCOUNT_BANNED', 'Your account has been suspended.', 403),
        };
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());

        return $this->success(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        match ($user->role) {
        'applicant'                    => $user->load('applicantProfile'),
        'hr', 'company_admin'          => $user->load('companyProfile'),
        'moderator', 'super_admin'     => null, // no profile to load
        default                        => null,
    };
        
        return $this->success(data: $user);
    }

}
