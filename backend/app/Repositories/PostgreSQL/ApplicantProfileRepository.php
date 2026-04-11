<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\ApplicantProfile;
use Illuminate\Database\Eloquent\Collection;

class ApplicantProfileRepository
{
    public function findByUserId(string $userId): ?ApplicantProfile
    {
        return ApplicantProfile::where('user_id', $userId)->first();
    }

    public function findById(string $id): ?ApplicantProfile
    {
        return ApplicantProfile::find($id);
    }

    public function create(array $data): ApplicantProfile
    {
        return ApplicantProfile::create($data);
    }

    public function update(ApplicantProfile $profile, array $data): ApplicantProfile
    {
        $profile->update($data);

        return $profile->fresh();
    }

    public function incrementSwipeUsage(string $userId): void
    {
        ApplicantProfile::where('user_id', $userId)
            ->increment('daily_swipes_used');
    }

    public function resetDailySwipes(): int
    {
        return ApplicantProfile::query()->update([
            'daily_swipes_used' => 0,
            'swipe_reset_at' => now(),
        ]);
    }

    public function getActiveSubscribers(): Collection
    {
        return ApplicantProfile::where('subscription_status', 'active')
            ->where('subscription_tier', '!=', 'free')
            ->get();
    }

    public function addPoints(string $userId, int $points): void
    {
        ApplicantProfile::where('user_id', $userId)
            ->increment('total_points', $points);
    }

    public function deductPoints(string $userId, int $points): bool
    {
        $profile = $this->findByUserId($userId);

        if (! $profile || $profile->total_points < $points) {
            return false;
        }

        $profile->decrement('total_points', $points);

        return true;
    }
}
