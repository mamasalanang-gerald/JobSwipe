<?php

namespace App\Services\Subscription;

use App\Exceptions\SubscriptionException;
use Carbon\Carbon;
use Google\Client as GoogleClient;
use Google\Service\AndroidPublisher;
use Throwable;

class GooglePlayProvider implements SubscriptionProviderInterface
{
    public function validateReceipt(string $receiptOrToken, string $productId): SubscriptionReceipt
    {
        if ($this->isMockMode()) {
            return $this->mockReceipt($receiptOrToken, $productId);
        }

        $subscriptionPurchase = $this->verifyPurchaseToken($receiptOrToken, $productId);

        $productMapping = $this->resolveProduct($productId);
        $expiresAt = isset($subscriptionPurchase['expiryTimeMillis'])
            ? Carbon::createFromTimestampMs($subscriptionPurchase['expiryTimeMillis'])
            : now()->addMonth();

        $status = $this->mapGoogleStatus($subscriptionPurchase);

        return new SubscriptionReceipt(
            providerTransactionId: (string) ($subscriptionPurchase['orderId'] ?? $receiptOrToken),
            productId: $productId,
            status: $status,
            subscriptionType: $productMapping['type'],
            tier: $productMapping['tier'],
            billingCycle: $productMapping['cycle'],
            expiresAt: $expiresAt,
            autoRenewEnabled: (bool) ($subscriptionPurchase['autoRenewing'] ?? true),
            rawReceipt: $receiptOrToken,
        );
    }

    public function handleNotification(array $payload): ?SubscriptionEvent
    {
        if ($this->isMockMode()) {
            return $this->mockNotification($payload);
        }

        // Google sends RTDN via Cloud Pub/Sub
        $data = $payload['message']['data'] ?? null;

        if (! is_string($data) || $data === '') {
            return null;
        }

        $decoded = json_decode(base64_decode($data), true);

        if (! is_array($decoded)) {
            return null;
        }

        $notification = $decoded['subscriptionNotification'] ?? null;

        if (! is_array($notification)) {
            return null;
        }

        $notificationType = (int) ($notification['notificationType'] ?? 0);
        $purchaseToken = (string) ($notification['purchaseToken'] ?? '');
        $subscriptionId = (string) ($notification['subscriptionId'] ?? '');

        if ($purchaseToken === '') {
            return null;
        }

        // Google Play RTDN notification types
        // See: https://developer.android.com/google/play/billing/rtdn-reference
        $type = match ($notificationType) {
            1 => 'renewed',         // SUBSCRIPTION_RECOVERED
            2 => 'renewed',         // SUBSCRIPTION_RENEWED
            3 => 'cancelled',       // SUBSCRIPTION_CANCELED
            4 => 'activated',       // SUBSCRIPTION_PURCHASED
            5 => 'cancelled',       // SUBSCRIPTION_ON_HOLD
            6 => 'renewed',         // SUBSCRIPTION_IN_GRACE_PERIOD
            7 => 'renewed',         // SUBSCRIPTION_RESTARTED
            9 => 'cancelled',       // SUBSCRIPTION_DEFERRED (price change declined)
            10 => 'cancelled',      // SUBSCRIPTION_PAUSED
            12 => 'cancelled',      // SUBSCRIPTION_REVOKED
            13 => 'expired',        // SUBSCRIPTION_EXPIRED
            default => null,
        };

        if ($type === null) {
            return null;
        }

        return new SubscriptionEvent(
            type: $type,
            providerTransactionId: $purchaseToken,
            productId: $subscriptionId !== '' ? $subscriptionId : null,
        );
    }

    public function getProviderName(): string
    {
        return 'google_play';
    }

    private function verifyPurchaseToken(string $purchaseToken, string $productId): array
    {
        $packageName = (string) config('services.google_play.package_name', '');
        $credentialsPath = (string) config('services.google_play.credentials_path', '');

        if ($packageName === '' || $credentialsPath === '') {
            throw new SubscriptionException(
                'GOOGLE_PLAY_NOT_CONFIGURED',
                'Google Play credentials are not configured.',
                500
            );
        }

        try {
            $client = new GoogleClient;
            $client->setAuthConfig($credentialsPath);
            $client->addScope(AndroidPublisher::ANDROIDPUBLISHER);

            $service = new AndroidPublisher($client);

            $purchase = $service->purchases_subscriptionsv2->get(
                $packageName,
                $purchaseToken
            );

            return json_decode(json_encode($purchase->toSimpleObject()), true) ?: [];
        } catch (Throwable $e) {
            throw new SubscriptionException(
                'GOOGLE_PLAY_VALIDATION_FAILED',
                'Failed to validate Google Play purchase: '.$e->getMessage(),
                400
            );
        }
    }

    private function mapGoogleStatus(array $purchase): string
    {
        // subscriptionState for subscriptionsv2
        $state = (string) ($purchase['subscriptionState'] ?? '');

        return match ($state) {
            'SUBSCRIPTION_STATE_ACTIVE' => 'active',
            'SUBSCRIPTION_STATE_CANCELED' => 'cancelled',
            'SUBSCRIPTION_STATE_IN_GRACE_PERIOD' => 'active',
            'SUBSCRIPTION_STATE_ON_HOLD' => 'past_due',
            'SUBSCRIPTION_STATE_PAUSED' => 'cancelled',
            'SUBSCRIPTION_STATE_EXPIRED' => 'expired',
            default => $this->mapLegacyGoogleStatus($purchase),
        };
    }

    private function mapLegacyGoogleStatus(array $purchase): string
    {
        // Legacy v1 API fallback
        $paymentState = (int) ($purchase['paymentState'] ?? -1);
        $cancelReason = $purchase['cancelReason'] ?? null;

        if ($cancelReason !== null) {
            return 'cancelled';
        }

        return match ($paymentState) {
            0 => 'past_due',    // Payment pending
            1 => 'active',     // Payment received
            2 => 'active',     // Free trial
            3 => 'past_due',   // Pending deferred upgrade/downgrade
            default => 'expired',
        };
    }

    private function resolveProduct(string $productId): array
    {
        $products = config('subscription_products.google', []);

        if (isset($products[$productId])) {
            return $products[$productId];
        }

        throw new SubscriptionException(
            'GOOGLE_UNKNOWN_PRODUCT',
            "Unknown Google Play product ID: {$productId}",
            400
        );
    }

    private function isMockMode(): bool
    {
        if (app()->environment('production') && config('services.iap_mock_mode', false)) {
            throw new SubscriptionException(
                'MOCK_MODE_IN_PRODUCTION',
                'IAP mock mode cannot be enabled in production.',
                500
            );
        }

        return (bool) config('services.iap_mock_mode', false);
    }

    private function mockReceipt(string $receiptOrToken, string $productId): SubscriptionReceipt
    {
        $productMapping = $this->resolveProductForMock($productId);

        return new SubscriptionReceipt(
            providerTransactionId: 'mock_google_txn_'.uniqid(),
            productId: $productId,
            status: 'active',
            subscriptionType: $productMapping['type'],
            tier: $productMapping['tier'],
            billingCycle: $productMapping['cycle'],
            expiresAt: now()->addMonth(),
            autoRenewEnabled: true,
            rawReceipt: $receiptOrToken,
        );
    }

    private function mockNotification(array $payload): ?SubscriptionEvent
    {
        $data = $payload['message']['data'] ?? null;

        if (! is_string($data)) {
            return null;
        }

        return new SubscriptionEvent(
            type: 'renewed',
            providerTransactionId: 'mock_google_txn_'.uniqid(),
            expiresAt: now()->addMonth(),
            autoRenewEnabled: true,
        );
    }

    private function resolveProductForMock(string $productId): array
    {
        $products = config('subscription_products.google', []);

        return $products[$productId] ?? ['tier' => 'pro', 'cycle' => 'monthly', 'type' => 'subscription'];
    }
}
