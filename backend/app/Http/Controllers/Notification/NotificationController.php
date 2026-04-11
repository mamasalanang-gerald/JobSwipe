<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\UpdateNotificationPreferencesRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notifications,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notifications->getForUser($request->user()->id);

        return $this->success(data: $notifications);
    }

    public function unread(Request $request): JsonResponse
    {
        $notifications = $this->notifications->getUnread($request->user()->id);
        $count = $this->notifications->getUnreadCount($request->user()->id);

        return $this->success(data: [
            'notifications' => $notifications,
            'unread_count' => $count,
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->notifications->markAsRead($id);

        return $this->success(message: 'Notification marked as read');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notifications->markAllAsRead($request->user()->id);

        return $this->success(message: 'All notifications marked as read');
    }

    public function getPreferences(Request $request): JsonResponse
    {
        $preferences = $this->notifications->getNotificationPreferences($request->user()->id);

        return $this->success(data: $preferences);
    }

    public function updatePreferences(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $this->notifications->updateNotificationPreferences(
            $request->user()->id,
            $request->validated()
        );

        return $this->success(message: 'Notification preferences updated');
    }
}
