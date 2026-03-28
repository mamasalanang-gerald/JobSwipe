<?php

namespace App\Services\Subscription;

use Carbon\Carbon;

class SubscriptionReceipt
{
    public function __construct(
        public readonly string $providerTransactionId,
        public readonly string $productId,
        public readonly string $status,
        public readonly string $subscriptionType,
        public readonly string $tier,
        public readonly string $billingCycle,
        public readonly Carbon $expiresAt,
        public readonly bool $autoRenewEnabled,
        public readonly ?string $rawReceipt = null,
    ) {}

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function toArray(): array
    {
        return [
            'provider_transaction_id' => $this->providerTransactionId,
            'product_id' => $this->productId,
            'status' => $this->status,
            'subscription_type' => $this->subscriptionType,
            'tier' => $this->tier,
            'billing_cycle' => $this->billingCycle,
            'expires_at' => $this->expiresAt->toIso8601String(),
            'auto_renew_enabled' => $this->autoRenewEnabled,
        ];
    }
}
