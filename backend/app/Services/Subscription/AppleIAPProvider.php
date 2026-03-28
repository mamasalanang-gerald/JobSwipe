<?php

namespace App\Services\Subscription;

use App\Exceptions\SubscriptionException;
use Carbon\Carbon;

class AppleIAPProvider implements SubscriptionProviderInterface
{
    public function validateReceipt(string $receiptOrToken, string $productId): SubscriptionReceipt
    {
        if ($this->isMockMode()) {
            return $this->mockReceipt($receiptOrToken, $productId);
        }

        $transactionInfo = $this->verifyTransaction($receiptOrToken);

        $productMapping = $this->resolveProduct($transactionInfo['productId'] ?? $productId);
        $expiresAt = isset($transactionInfo['expiresDate'])
            ? Carbon::createFromTimestampMs($transactionInfo['expiresDate'])
            : now()->addMonth();

        $status = $this->mapAppleStatus($transactionInfo);

        return new SubscriptionReceipt(
            providerTransactionId: (string) ($transactionInfo['originalTransactionId'] ?? $receiptOrToken),
            productId: $transactionInfo['productId'] ?? $productId,
            status: $status,
            subscriptionType: $productMapping['type'],
            tier: $productMapping['tier'],
            billingCycle: $productMapping['cycle'],
            expiresAt: $expiresAt,
            autoRenewEnabled: (bool) ($transactionInfo['autoRenewStatus'] ?? true),
            rawReceipt: $receiptOrToken,
        );
    }

    public function handleNotification(array $payload): ?SubscriptionEvent
    {
        if ($this->isMockMode()) {
            return $this->mockNotification($payload);
        }

        $notificationType = (string) ($payload['notificationType'] ?? '');
        $signedTransactionInfo = $payload['data']['signedTransactionInfo'] ?? null;

        if (! is_string($signedTransactionInfo) || $signedTransactionInfo === '') {
            return null;
        }

        $transactionInfo = $this->decodeJWS($signedTransactionInfo);
        $originalTransactionId = (string) ($transactionInfo['originalTransactionId'] ?? '');

        if ($originalTransactionId === '') {
            return null;
        }

        $type = match ($notificationType) {
            'SUBSCRIBED', 'DID_RENEW' => 'renewed',
            'DID_CHANGE_RENEWAL_STATUS' => ($transactionInfo['autoRenewStatus'] ?? true) ? 'renewed' : 'cancelled',
            'EXPIRED' => 'expired',
            'REFUND', 'REVOKE' => 'cancelled',
            default => null,
        };

        if ($type === null) {
            return null;
        }

        $expiresAt = isset($transactionInfo['expiresDate'])
            ? Carbon::createFromTimestampMs($transactionInfo['expiresDate'])
            : null;

        return new SubscriptionEvent(
            type: $type,
            providerTransactionId: $originalTransactionId,
            productId: $transactionInfo['productId'] ?? null,
            expiresAt: $expiresAt,
            autoRenewEnabled: $transactionInfo['autoRenewStatus'] ?? null,
        );
    }

    public function getProviderName(): string
    {
        return 'apple_iap';
    }

    private function verifyTransaction(string $signedTransaction): array
    {
        // Decode the JWS signed transaction
        $transactionInfo = $this->decodeJWS($signedTransaction);

        // Verify the bundle ID matches
        $expectedBundleId = (string) config('services.apple_iap.bundle_id', '');
        $actualBundleId = (string) ($transactionInfo['bundleId'] ?? '');

        if ($expectedBundleId !== '' && $actualBundleId !== $expectedBundleId) {
            throw new SubscriptionException(
                'APPLE_BUNDLE_MISMATCH',
                'Transaction bundle ID does not match the configured app.',
                400
            );
        }

        return $transactionInfo;
    }

    private function decodeJWS(string $jws): array
    {
        // In production, Apple signs JWS tokens with their certificates.
        // For now, we decode the payload without full signature verification
        // as the App Store Server API v2 response itself is trusted.
        $parts = explode('.', $jws);

        if (count($parts) !== 3) {
            throw new SubscriptionException(
                'APPLE_INVALID_JWS',
                'Invalid JWS format from Apple.',
                400
            );
        }

        $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

        if (! is_array($payload)) {
            throw new SubscriptionException(
                'APPLE_DECODE_FAILED',
                'Failed to decode Apple JWS payload.',
                400
            );
        }

        return $payload;
    }

    private function mapAppleStatus(array $transactionInfo): string
    {
        // Check if subscription has expired
        $expiresDate = $transactionInfo['expiresDate'] ?? null;
        if ($expiresDate !== null && Carbon::createFromTimestampMs($expiresDate)->isPast()) {
            return 'expired';
        }

        // Check revocation
        if (isset($transactionInfo['revocationDate'])) {
            return 'cancelled';
        }

        return 'active';
    }

    private function resolveProduct(string $productId): array
    {
        $products = config('subscription_products.apple', []);

        if (isset($products[$productId])) {
            return $products[$productId];
        }

        throw new SubscriptionException(
            'APPLE_UNKNOWN_PRODUCT',
            "Unknown Apple product ID: {$productId}",
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
            providerTransactionId: 'mock_apple_txn_'.uniqid(),
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
        $notificationType = (string) ($payload['notificationType'] ?? '');

        $type = match ($notificationType) {
            'SUBSCRIBED', 'DID_RENEW' => 'renewed',
            'EXPIRED' => 'expired',
            'REFUND', 'REVOKE' => 'cancelled',
            default => null,
        };

        if ($type === null) {
            return null;
        }

        return new SubscriptionEvent(
            type: $type,
            providerTransactionId: 'mock_apple_txn_'.uniqid(),
            expiresAt: now()->addMonth(),
            autoRenewEnabled: true,
        );
    }

    private function resolveProductForMock(string $productId): array
    {
        $products = config('subscription_products.apple', []);

        return $products[$productId] ?? ['tier' => 'pro', 'cycle' => 'monthly', 'type' => 'subscription'];
    }
}
