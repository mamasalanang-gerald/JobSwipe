<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Repositories\Redis\OTPCacheRepository;
use Illuminate\Support\Facades\Mail;

class OTPService
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(private OTPCacheRepository $otpCache) {}

    public function sendOtp(string $email): void
    {
        $code = $this->generateCode();
        $codeHash = $this->hashCode($code);

        $this->otpCache->store($email, $codeHash);

        Mail::to($email)->send(new EmailVerificationMail($code));
    }

    public function verify(string $email, string $submittedCode): string
    {
        $stored = $this->otpCache->get($email);

        if ($stored == null) {
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

        $this->otpCache->delete($email);

        return 'valid';
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
