<?php

namespace App\Services\Subscription;

use Carbon\Carbon;

class SubscriptionEvent
{
    public function __construct(
        public readonly string $type,
        public readonly string $providerTransactionId,
        public readonly ?string $productId = null,
        public readonly ?Carbon $expiresAt = null,
        public readonly ?bool $autoRenewEnabled = null,
    ) {}

    public function isActivation(): bool
    {
        return in_array($this->type, ['activated', 'renewed'], true);
    }

    public function isCancellation(): bool
    {
        return $this->type === 'cancelled';
    }

    public function isExpiration(): bool
    {
        return $this->type === 'expired';
    }
}
