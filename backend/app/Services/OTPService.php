<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Repositories\Redis\OTPCacheRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OTPService
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(private OTPCacheRepository $otpCache) {}

    public function sendOtp(string $email, ?string $passwordHash = null, ?string $role = null): bool
    {
        Log::info('OTPService: Starting sendOtp', [
            'email' => $email,
            'has_password_hash' => ! is_null($passwordHash),
            'role' => $role,
            'queue_connection' => config('queue.default'),
            'mail_mailer' => config('mail.default'),
        ]);

        $code = $this->generateCode();
        $codeHash = $this->hashCode($code);
        $stored = $this->otpCache->get($email);

        $resolvedPasswordHash = $passwordHash ?? ($stored['password_hash'] ?? null);
        $resolvedRole = $role ?? ($stored['role'] ?? null);

        if ($resolvedPasswordHash === null || $resolvedRole === null) {
            return false;
        }

        $this->otpCache->store($email, $codeHash, $resolvedPasswordHash, $resolvedRole);

        Mail::to($email)->queue(new EmailVerificationMail($code));

        return true;
    }

    public function verify(string $email, string $submittedCode): string
    {
        $stored = $this->otpCache->get($email);

        if ($stored === null) {
            return 'expired';
        }

        $attempts = (int) ($stored['attempts'] ?? 0);

        if ($attempts >= self::MAX_ATTEMPTS) {
            return 'max_attempts';
        }

        $submittedHash = $this->hashCode($submittedCode);

        if (! hash_equals($stored['code_hash'], $submittedHash)) {
            $this->otpCache->incrementAttempts($email);

            return 'invalid';
        }

        // Don't delete yet - we need the stored data for registration
        return 'valid';
    }

    public function getStoredData(string $email): ?array
    {
        return $this->otpCache->get($email);
    }

    public function clearStoredData(string $email): void
    {
        $this->otpCache->delete($email);
    }

    public function hasActiveOTP(string $email): bool
    {
        return $this->otpCache->exists($email);
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function hashCode(string $code): string
    {
        return hash('sha256', $code);
    }
}
