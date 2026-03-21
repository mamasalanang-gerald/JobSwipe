<?php

namespace App\Repositories\Redis;

use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;

class OTPCacheRepository
{
    private function key(string $email): string
    {
        return 'otp:'.hash('sha256', strtolower(trim($email)));
    }

    public function store(string $email, string $codeHash): void
    {
        $key = $this->key($email);

        Redis::hset($key, 'code_hash', $codeHash);
        Redis::hset($key, 'attempts', 0);
        Redis::hset($key, 'created_at', Carbon::now()->timestamp);
        Redis::expire($key, 600);
    }

    public function get(string $email): ?array
    {
        $key = $this->key($email);
        $data = Redis::hgetall($key);

        if (! Redis::exists($key)) {
            return null;
        }

        return $data;
    }

    public function incrementAttempts(string $email): int
    {
        return (int) Redis::hincrby($this->key($email), 'attempts', 1);
    }

    public function delete(string $email): void
    {
        Redis::del($this->key($email));
    }

    public function exists(string $email): bool
    {
        return (bool) Redis::exists($this->key($email));
    }
}
