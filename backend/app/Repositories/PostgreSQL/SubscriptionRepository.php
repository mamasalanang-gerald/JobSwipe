<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\IAPReceipt;
use App\Models\PostgreSQL\IAPTransaction;
use App\Models\PostgreSQL\Subscription;
use Illuminate\Support\Collection;

class SubscriptionRepository
{
    public function create(array $data): Subscription
    {
        return Subscription::create($data);
    }

    public function findByProviderSubId(string $providerSubId, string $paymentProvider): ?Subscription
    {
        return Subscription::where('provider_sub_id', $providerSubId)
            ->where('payment_provider', $paymentProvider)
            ->first();
    }

    public function findActiveForUser(string $userId): ?Subscription
    {
        return Subscription::where('user_id', $userId)
            ->where('subscriber_type', 'applicant')
            ->where('status', 'active')
            ->first();
    }

    public function findByTransactionId(string $transactionId): ?Subscription
    {
        $transaction = IAPTransaction::where('transaction_id', $transactionId)
            ->first();

        if (! $transaction) {
            return null;
        }

        $receipt = IAPReceipt::where('transaction_id', $transactionId)
            ->where('payment_provider', $transaction->payment_provider)
            ->orderByDesc('verified_at')
            ->first();

        $providerSubId = (string) data_get(
            $receipt?->verification_response,
            'provider_sub_id',
            $transactionId
        );

        return Subscription::where('user_id', $transaction->user_id)
            ->where('subscriber_type', 'applicant')
            ->where('payment_provider', $transaction->payment_provider)
            ->where('provider_sub_id', $providerSubId)
            ->orderBy('created_at', 'desc')
            ->first();
    }

    public function update(Subscription $subscription, array $data): void
    {
        $subscription->update($data);
    }

    public function getAllForUser(string $userId): Collection
    {
        return Subscription::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
