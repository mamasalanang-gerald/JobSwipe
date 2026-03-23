<?php

namespace App\Repositories\MongoDB;

use App\Models\MongoDB\SwipeHistory;
use Carbon\Carbon;

class SwipeHistoryRepository
{
    public function recordSwipe(array $data): SwipeHistory
    {
        return SwipeHistory::create(array_merge($data, [
            'swiped_at' => now(),
        ]));
    }

    public function hasSwipedOn(string $userId, string $targetId): bool
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('target_id', $targetId)
            ->exists();
    }

    public function getUserHistory(string $userId, int $limit = 100): \Illuminate\Support\Collection
    {
        return SwipeHistory::where('user_id', $userId)
            ->orderBy('swiped_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getByDirection(string $userId, string $direction): \Illuminate\Support\Collection
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

    public function getMutualSwipes(string $userId, string $targetId): \Illuminate\Support\Collection
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
