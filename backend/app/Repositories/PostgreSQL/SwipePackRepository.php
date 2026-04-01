<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\SwipePack;
use Illuminate\Support\Collection;

class SwipePackRepository
{
    public function create(array $data): SwipePack
    {
        return SwipePack::create($data);
    }

    public function findByTransactionId(string $transactionId): ?SwipePack
    {
        // Find the transaction first to get the provider_payment_id
        $transaction = \App\Models\PostgreSQL\IAPTransaction::where('transaction_id', $transactionId)
            ->first();

        if (! $transaction) {
            return null;
        }

        // Find the swipe pack by provider_payment_id
        // Since provider_payment_id should match the transaction_id for swipe packs
        return SwipePack::where('provider_payment_id', $transactionId)
            ->first();
    }

    public function getAllForApplicant(string $applicantId): Collection
    {
        return SwipePack::where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
