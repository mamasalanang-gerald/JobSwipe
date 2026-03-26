<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Repositories\Redis\OTPCacheRepository;
use Illuminate\Support\Facades\Mail;

class OTPService
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(private OTPCacheRepository $otpCache) {}

    public function sendOtp(string $email, ?string $passwordHash = null, ?string $role = null): void
    {
        error_log('=== OTP SERVICE: Sending OTP to '.$email.' ===');
        \Log::info('OTPService: Starting sendOtp', [
            'email' => $email,
            'has_password_hash' => ! is_null($passwordHash),
            'role' => $role,
            'queue_connection' => config('queue.default'),
            'mail_mailer' => config('mail.default'),
        ]);

        $code = $this->generateCode();
        $codeHash = $this->hashCode($code);

        try {
            $this->otpCache->store($email, $codeHash, $passwordHash, $role);
            \Log::info('OTPService: Stored OTP in Redis', ['email' => $email]);
        } catch (\Exception $e) {
            \Log::error('OTPService: Failed to store OTP in Redis', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        try {
            error_log('=== MAIL: Attempting to send to '.$email.' via '.config('mail.mailers.smtp.host').' ===');
            \Log::info('OTPService: Sending email', [
                'email' => $email,
                'code_preview' => substr($code, 0, 2).'****',
                'method' => 'sync',
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_port' => config('mail.mailers.smtp.port'),
            ]);

            // Send synchronously with timeout handling
            $startTime = microtime(true);
            Mail::to($email)->send(new EmailVerificationMail($code));
            $duration = microtime(true) - $startTime;

            error_log('=== MAIL: Email sent successfully in '.round($duration, 2).'s ===');
            \Log::info('OTPService: Email sent successfully', [
                'email' => $email,
                'duration_seconds' => round($duration, 2),
            ]);
        } catch (\Exception $e) {
            error_log('=== MAIL ERROR: '.$e->getMessage().' ===');
            \Log::error('OTPService: Failed to send email', [
                'email' => $email,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            // Don't throw - let registration succeed even if email fails
            // User can request resend later
            \Log::warning('OTPService: Continuing despite email failure');
        }
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
