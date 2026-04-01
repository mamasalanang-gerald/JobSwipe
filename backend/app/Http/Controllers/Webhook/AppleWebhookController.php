<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\IAPService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AppleWebhookController extends Controller
{
    public function __construct(private IAPService $iapService) {}

    /**
     * Handle Apple server notification
     * POST /api/v1/webhooks/apple-iap
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            $notification = $request->all();

            Log::info('Apple webhook received', [
                'notification_type' => $notification['notificationType'] ?? 'unknown',
            ]);

            $this->iapService->processAppleWebhook($notification);

            return $this->success(['status' => 'accepted'], 'Webhook received');
        } catch (\Exception $e) {
            Log::error('Apple webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return 200 to prevent Apple from retrying on our application errors
            return $this->error('WEBHOOK_PROCESSING_FAILED', 'Webhook processing failed', 200);
        }
    }
}
