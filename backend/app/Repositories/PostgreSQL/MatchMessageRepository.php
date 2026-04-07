<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\MatchMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MatchMessageRepository
{
    public function create(string $matchId, string $senderId, string $body): MatchMessage
    {
        return MatchMessage::create([
            'match_id' => $matchId,
            'sender_id' => $senderId,
            'body' => $body,
        ]);
    }

    public function getForMatch(string $matchId, int $perPage = 50): LengthAwarePaginator
    {
        return MatchMessage::where('match_id', $matchId)
            ->with('sender:id,role')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function markAsRead(string $matchId, string $userId): int
    {
        return MatchMessage::where('match_id', $matchId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(string $matchId, string $userId): int
    {
        return MatchMessage::where('match_id', $matchId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
