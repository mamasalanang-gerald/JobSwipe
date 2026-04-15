<?php

namespace App\Repositories\PostgreSQL;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class WebhookEventRepository
{
    /**
     * Reserve a webhook event ID for deduplication.
     * Returns true if the event was successfully inserted (first time processing).
     * Returns false if the event already exists (duplicate webhook).
     */
    public function reserve(
        string $eventId,
        string $paymentProvider,
        string $eventType
    ): bool {
        try {
            DB::table('iap_webhook_events')->insert([
                'event_id' => $eventId,
                'payment_provider' => $paymentProvider,
                'event_type' => $eventType,
                'created_at' => now(),
            ]);

            return true;
        } catch (QueryException $e) {
            // Check for unique constraint violation (SQLSTATE 23000 or 23505)
            if (in_array($e->getCode(), ['23000', '23505'])) {
                return false;
            }

            // Re-throw if it's a different error
            throw $e;
        }
    }
}
