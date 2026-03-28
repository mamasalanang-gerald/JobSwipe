<?php

namespace App\Services\Subscription;

use App\Exceptions\SubscriptionException;
use Carbon\Carbon;
use Stripe\StripeClient;
use Throwable;

class StripeProvider implements SubscriptionProviderInterface
{
    public function validateReceipt(string $receiptOrToken, string $productId): SubscriptionReceipt
    {
        $stripe = $this->stripeClient();

        try {
            $subscription = $stripe->subscriptions->retrieve($receiptOrToken);
        } catch (Throwable $e) {
            throw new SubscriptionException(
                'STRIPE_VALIDATION_FAILED',
                'Failed to validate Stripe subscription: '.$e->getMessage(),
                400
            );
        }

        $status = $this->mapStripeStatus((string) ($subscription->status ?? 'inactive'));
        $productMapping = $this->resolveProduct($productId);
        $currentPeriodEnd = Carbon::createFromTimestampUTC($subscription->current_period_end);

        return new SubscriptionReceipt(
            providerTransactionId: (string) $subscription->id,
            productId: $productId,
            status: $status,
            subscriptionType: $productMapping['type'],
            tier: $productMapping['tier'],
            billingCycle: $productMapping['cycle'],
            expiresAt: $currentPeriodEnd,
            autoRenewEnabled: ! $subscription->cancel_at_period_end,
        );
    }

    public function handleNotification(array $payload): ?SubscriptionEvent
    {
        $eventType = (string) ($payload['type'] ?? '');
        $object = $payload['data']['object'] ?? [];

        if (! is_array($object)) {
            return null;
        }

        $providerSubId = (string) ($object['id'] ?? '');

        if ($providerSubId === '') {
            return null;
        }

        $type = match ($eventType) {
            'checkout.session.completed' => 'activated',
            'customer.subscription.updated' => $this->resolveUpdateType($object),
            'customer.subscription.deleted' => 'cancelled',
            'invoice.payment_succeeded' => 'renewed',
            default => null,
        };

        if ($type === null) {
            return null;
        }

        // For checkout.session.completed, the subscription ID is in the 'subscription' field
        if ($eventType === 'checkout.session.completed') {
            $providerSubId = (string) ($object['subscription'] ?? $providerSubId);
        }

        $expiresAt = null;
        if (isset($object['current_period_end']) && is_int($object['current_period_end'])) {
            $expiresAt = Carbon::createFromTimestampUTC($object['current_period_end']);
        }

        return new SubscriptionEvent(
            type: $type,
            providerTransactionId: $providerSubId,
            expiresAt: $expiresAt,
            autoRenewEnabled: isset($object['cancel_at_period_end']) ? ! $object['cancel_at_period_end'] : null,
        );
    }

    public function getProviderName(): string
    {
        return 'stripe';
    }

    public function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'active', 'trialing' => 'active',
            'past_due', 'incomplete', 'incomplete_expired', 'unpaid' => 'past_due',
            'canceled' => 'cancelled',
            default => 'expired',
        };
    }

    private function resolveUpdateType(array $object): string
    {
        $status = (string) ($object['status'] ?? '');

        if ($status === 'canceled' || ($object['cancel_at_period_end'] ?? false)) {
            return 'cancelled';
        }

        return 'renewed';
    }

    private function resolveProduct(string $productId): array
    {
        $products = config('subscription_products.stripe', []);

        if (isset($products[$productId])) {
            return $products[$productId];
        }

        // Default fallback for verification badge
        return ['tier' => 'basic', 'cycle' => 'monthly', 'type' => 'verification'];
    }

    private function stripeClient(): StripeClient
    {
        $secret = (string) (config('services.stripe.secret') ?: config('cashier.secret', ''));

        if ($secret === '') {
            throw new SubscriptionException('STRIPE_NOT_CONFIGURED', 'Stripe secret key is missing.', 500);
        }

        return new StripeClient($secret);
    }
}
