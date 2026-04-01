<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\IAPService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GoogleWebhookController extends Controller
{
    public function __construct(private IAPService $iapService) {}

    /**
     * Handle Google Play notification
     * POST /api/v1/webhooks/google-play
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            $notification = $request->all();

            Log::info('Google Play webhook received', [
                'message_id' => $notification['message']['messageId'] ?? 'unknown',
            ]);

            $this->iapService->processGoogleWebhook($notification);

            return $this->success(['status' => 'accepted'], 'Webhook received');
        } catch (\Exception $e) {
            Log::error('Google Play webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return 200 to prevent Google from retrying on our application errors
            return $this->error('WEBHOOK_PROCESSING_FAILED', 'Webhook processing failed', 200);
        }
    }
}
