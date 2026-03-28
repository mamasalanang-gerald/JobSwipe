<?php

namespace App\Services\Subscription;

interface SubscriptionProviderInterface
{
    /**
     * Validate a receipt/token from the provider and return normalized subscription data.
     *
     * @param  string  $receiptOrToken  The receipt data (Apple JWS) or purchase token (Google)
     * @param  string  $productId  The product ID as defined in the respective store
     */
    public function validateReceipt(string $receiptOrToken, string $productId): SubscriptionReceipt;

    /**
     * Handle an incoming webhook/notification from the provider.
     *
     * @param  array  $payload  The raw notification payload
     * @return SubscriptionEvent|null Null if the event should be ignored
     */
    public function handleNotification(array $payload): ?SubscriptionEvent;

    /**
     * Get the provider name identifier (e.g., 'stripe', 'apple_iap', 'google_play').
     */
    public function getProviderName(): string;
}
