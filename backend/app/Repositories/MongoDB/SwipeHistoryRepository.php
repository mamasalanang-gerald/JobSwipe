<?php

namespace App\Repositories\MongoDB;

use App\Models\MongoDB\SwipeHistory;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SwipeHistoryRepository
{
    public function recordSwipe(array $data): SwipeHistory
    {
        return SwipeHistory::create(array_merge($data, [
            'swiped_at' => now(),
        ]));
    }

    public function hasSwipedOn(string $userId, string $targetId, string $targetType): bool
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('target_id', $targetId)
            ->where('target_type', $targetType)
            ->exists();
    }

    public function hasHrSwipedOn(string $hrUserId, string $jobPostingId, string $applicantId): bool
    {
        return SwipeHistory::where('user_id', $hrUserId)
            ->where('actor_type', 'hr')
            ->where('job_posting_id', $jobPostingId)
            ->where('target_id', $applicantId)
            ->exists();
    }

    public function getSeenJobIds(string $userId): array
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('actor_type', 'applicant')
            ->where('target_type', 'job_posting')
            ->pluck('target_id')
            ->toArray();
    }

    public function getSeenApplicantIds(string $hrUserId, string $jobPostingId): array
    {
        return SwipeHistory::where('user_id', $hrUserId)
            ->where('actor_type', 'hr')
            ->where('job_posting_id', $jobPostingId)
            ->pluck('target_id')
            ->toArray();
    }

    public function getUserHistory(string $userId, int $limit = 100): Collection
    {
        return SwipeHistory::where('user_id', $userId)
            ->orderBy('swiped_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getByDirection(string $userId, string $direction): Collection
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('direction', $direction)
            ->orderBy('swiped_at', 'desc')
            ->get();
    }

    public function countTodaySwipes(string $userId): int
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('swiped_at', '>=', Carbon::today())
            ->count();
    }

    public function getMutualSwipes(string $userId, string $targetId): Collection
    {
        return SwipeHistory::where(function ($query) use ($userId, $targetId) {
            $query->where('user_id', $userId)
                ->where('target_id', $targetId)
                ->where('direction', 'right');
        })->orWhere(function ($query) use ($userId, $targetId) {
            $query->where('user_id', $targetId)
                ->where('target_id', $userId)
                ->where('direction', 'right');
        })->get();
    }
}
