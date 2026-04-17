<?php

namespace App\Services;

use App\Models\PostgreSQL\User;

class TokenService
{
    private const TOKEN_NAME = 'auth_token';

    public function generateToken(User $user): string
    {
        return $user->createToken(self::TOKEN_NAME)->plainTextToken;
    }

    public function revokeCurrentToken(User $user): void
    {
        // In normal requests, currentAccessToken() is set by Sanctum middleware
        // In tests, it might be null, so we handle that gracefully
        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }
    }

    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    public function hasActiveTokens(User $user): bool
    {
        return $user->tokens()->count() > 0;
    }
}
