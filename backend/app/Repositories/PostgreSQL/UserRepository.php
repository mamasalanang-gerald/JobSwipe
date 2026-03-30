<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\User;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', strtolower(trim($email)))->first();
    }

    public function findById(string $id): ?User
    {
        return User::find($id);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return User::where('google_id', $googleId)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function markEmailVerified(string $email): void
    {
        User::where('email', strtolower(trim($email)))
            ->update([
                'email_verified_at' => now(),
            ]);
    }

    public function emailExists(string $email): bool
    {
        return User::where('email', strtolower(trim($email)))->exists();
    }
}
