<?php

namespace App\Services;

use App\Jobs\SendWelcomeEmail;
use App\Repositories\PostgreSQL\UserRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    public function __construct(
        private UserRepository $users,
        private OTPService $otp,
        private ProfileService $profiles,
        private TokenService $tokens,
    ) {}

    public function initiateRegistration(string $email, string $password, string $role): string
    {
        Log::info('AuthService: Starting registration', [
            'email' => $email,
            'role' => $role,
        ]);

        if ($this->users->emailExists($email)) {
            Log::warning('AuthService: Email already exists', ['email' => $email]);

            return 'email_taken';
        }

        $passwordHash = Hash::make($password, ['rounds' => config('hashing.bcrypt.rounds', 10)]);

        try {
            $this->otp->sendOtp($email, $passwordHash, $role);
            Log::info('AuthService: OTP sent successfully', ['email' => $email]);
        } catch (Exception $e) {
            Log::error('AuthService: Failed to send OTP', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        return 'otp_sent';
    }

    public function completeRegistration(string $email, string $code): array
    {
        $result = $this->otp->verify($email, $code);

        if ($result !== 'valid') {
            return ['status' => $result];
        }

        // Get stored registration data from Redis
        $storedData = $this->otp->getStoredData($email);

        if (! $storedData || ! isset($storedData['password_hash'], $storedData['role'])) {
            return ['status' => 'expired'];
        }

        // Use transaction to ensure atomicity
        DB::transaction(function () use ($email, $storedData, &$user, &$token) {
            // Create user with stored password hash
            $user = $this->users->create([
                'email' => strtolower(trim($email)),
                'password_hash' => $storedData['password_hash'],
                'role' => $storedData['role'],
                'email_verified_at' => now(),
            ]);

            // Create profile
            $this->profiles->createProfileForUser($user);

            // Generate token
            $token = $this->tokens->generateToken($user);
        });

        $this->otp->clearStoredData($email);

        // Dispatch welcome email job
        SendWelcomeEmail::dispatch($user->id)->onQueue('emails');

        return [
            'status' => 'verified',
            'token' => $token,
            'user' => $user,
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->getAuthPassword())) {
            return ['status' => 'invalid_credentials'];
        }

        if ($user->is_banned) {
            return ['status' => 'banned'];
        }

        if (! $user->hasVerifiedEmail()) {
            $this->otp->sendOtp($email, $user->password_hash, $user->role);

            return ['status' => 'unverified'];
        }

        $token = $this->tokens->generateToken($user);

        return [
            'status' => 'success',
            'token' => $token,
            'user' => $user,
        ];
    }

    public function logout($user): void
    {
        $this->tokens->revokeCurrentToken($user);
    }

    public function handleGoogleCallback(SocialiteUser $googleUser): array
    {
        $user = $this->users->findByGoogleId($googleUser->getId());

        if ($user && $user->role !== 'applicant') {
            return ['status' => 'role_not_allowed'];
        }

        if (! $user) {
            $user = $this->users->findByEmail($googleUser->getEmail());

            if ($user) {
                if ($user->role !== 'applicant') {
                    return ['status' => 'role_not_allowed'];
                }

                // Link Google account
                $this->users->update($user, [
                    'google_id' => $googleUser->getId(),
                ]);

                // Update profile photo if empty
                $this->profiles->updateApplicantPhoto($user->id, $googleUser->getAvatar());
            } else {
                // Create new user with transaction
                DB::transaction(function () use ($googleUser, &$user) {
                    $user = $this->users->create([
                        'email' => strtolower(trim($googleUser->getEmail())),
                        'password_hash' => Hash::make(str()->random(40)),
                        'role' => 'applicant',
                        'google_id' => $googleUser->getId(),
                        'email_verified_at' => now(),
                    ]);

                    $this->profiles->createProfileForUser($user, $googleUser->getAvatar());
                });

                // Dispatch welcome email for new users
                SendWelcomeEmail::dispatch($user->id)->onQueue('emails');
            }
        }

        if ($user->is_banned) {
            return ['status' => 'banned'];
        }

        $token = $this->tokens->generateToken($user);

        return [
            'status' => 'success',
            'token' => $token,
            'user' => $user,
            'is_new_user' => $user->wasRecentlyCreated,
        ];
    }

    public function resendOtp(string $email): void
    {
        $storedData = $this->otp->getStoredData($email);

        if ($storedData && isset($storedData['password_hash'], $storedData['role'])) {
            $this->otp->sendOtp($email);

            return;
        }

        $user = $this->users->findByEmail($email);

        if (! $user || $user->hasVerifiedEmail()) {
            return;
        }

        $this->otp->sendOtp($email, $user->password_hash, $user->role);
    }
}
