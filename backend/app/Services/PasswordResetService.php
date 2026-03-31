<?php

namespace App\Services;

use App\Mail\PasswordResetMail;
use App\Repositories\Redis\PasswordResetCacheRepository;
use Illuminate\Support\Facades\Mail;

class PasswordResetService
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(
        private PasswordResetCacheRepository $passwordResetCache
    ) {}

    public function sendResetCode(string $email): bool
    {
        $code = $this->generateCode();
        $codeHash = $this->hashCode($code);

        $this->passwordResetCache->store($email, $codeHash);

        Mail::to($email)->queue(new PasswordResetMail($code));

        return true;
    }

    public function verifyCode(string $email, string $submittedCode): string
    {
        $stored = $this->resetCache->get($email);

        if ($stored === null) {
            return 'expired';
        }

        $attempts = (int) ($stored['attempts'] ?? 0);

        if ($attempts >= self::MAX_ATTEMPTS) {
            return 'max_attempts';
        }

        $submittedHash = $this->hashCode($submittedCode);

<<<<<<< HEAD
<<<<<<< HEAD
        if (! hash_equals($stored['code_hash'], $submittedHash)) {
=======
        if (! hash_equals($stored['code_hash'], $submittedCode)) {
>>>>>>> 61bd784a31472e0ab9cc82c3b8a6d171fea95ebc
=======
        if (! hash_equals($stored['code_hash'], $submittedHash)) {
>>>>>>> ad5b5ac2eb98e83d3801268f775b57012676a747
            $this->passwordResetCache->incrementAttempts($email);

            return 'invalid';
        }

        return 'valid';
    }

    public function clearResetData(string $email): void
    {
        $this->passwordResetCache->delete($email);
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
