<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\Notification;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationRepository
{
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function getForUser(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getUnread(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getUnreadCount(string $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function markAsRead(string $notificationId): void
    {
        Notification::where('id', $notificationId)
            ->update(['read_at' => now()]);
    }

    public function markAllAsRead(string $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
