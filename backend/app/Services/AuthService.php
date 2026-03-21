<?php

namespace App\Services;

use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\CompanyProfile;
use App\Repositories\PostgreSQL\UserRepository;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    public function __construct(
        private UserRepository $users,
        private OTPService $otp,
    ) {}

    public function initiateRegistration(string $email, string $role): string
    {
        if ($this->users->emailExists($email)) {
            return 'email_taken';
        }

        $this->otp->sendOtp($email);

        return 'otp_sent';
    }

    public function completeRegistration(
        string $email,
        string $password,
        string $role,
        string $code
    ): array {
        $result = $this->otp->verify($email, $code);

        if ($result !== 'valid') {
            return ['status' => $result];
        }

        // Create the user record
        $user = $this->users->create([
            'email' => strtolower(trim($email)),
            'password_hash' => Hash::make($password),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        // Create the matching profile record based on role
        $this->createProfileForRole($user, $role);

        $token = $user->createToken('auth_token')->plainTextToken;

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
            // Resend OTP so they can complete verification
            $this->otp->sendOtp($email);

            return ['status' => 'unverified'];
        }

        // Revoke old tokens to enforce single-session (optional — remove if you
        // want to support multiple devices simultaneously)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'success',
            'token' => $token,
            'user' => $user,
        ];
    }

    // ── Logout ──────────────────────────────────────────────────────────────

    public function logout($user): void
    {
        // Revoke only the current token, not all tokens
        $user->currentAccessToken()->delete();
    }

    // ── Google OAuth ────────────────────────────────────────────────────────

    /**
     * Called after Google redirects back with user data.
     * Creates the account if new, logs in if existing.
     *
     * Only applicants may use Google OAuth.
     */
    public function handleGoogleCallback(SocialiteUser $googleUser): array
    {
        // Check if they already have an account linked to this Google ID
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

                $this->users->update($user, [
                    'google_id' => $googleUser->getId(),
                ]);

                $profileDoc = ApplicantProfileDocument::where('user_id', $user->id)->first();

                if ($profileDoc && empty($profileDoc->profile_photo_url)) {
                    $profileDoc->update(['profile_photo_url' => $googleUser->getAvatar()]);
                }
            } else {

                $user = $this->users->create([
                    'email' => strtolower(trim($googleUser->getEmail())),
                    'password_hash' => Hash::make(str()->random(40)),
                    'role' => 'applicant',
                    'google_id' => $googleUser->getId(),
                    'email_verified_at' => now(),
                ]);

                $this->createProfileForRole($user, 'applicant', $googleUser->getAvatar());

            }
        }

        if ($user->is_banned) {
            return ['status' => 'banned'];
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'success',
            'token' => $token,
            'user' => $user,
            'is_new_user' => $user->wasRecentlyCreated,
        ];
    }

    public function resendOtp(string $email): void
    {
        $this->otp->sendOtp($email);
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    private function createProfileForRole($user, string $role, ?string $avatarUrl = null): void
    {
        match ($role) {
            'applicant' => ApplicantProfileDocument::create([
                'user_id' => $user->id,
                'first_name' => '',
                'last_name' => '',
                'profile_photo_url' => $avatarUrl, // null for email/password reg
                'skills' => [],
                'work_experience' => [],
                'education' => [],
                'social_links' => [],
                'completed_profile_fields' => [],
            ]),
            'hr', 'company_admin' => CompanyProfile::create([
                'user_id' => $user->id,
                'company_name' => '',
            ]),
            default => null,
        };
    }
}
