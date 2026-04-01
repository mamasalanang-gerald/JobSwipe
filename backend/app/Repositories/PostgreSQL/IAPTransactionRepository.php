<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\IAPTransaction;

class IAPTransactionRepository
{
    public function store(
        string $transactionId,
        string $paymentProvider,
        string $userId,
        string $productId
    ): IAPTransaction {
        return IAPTransaction::create([
            'transaction_id' => $transactionId,
            'payment_provider' => $paymentProvider,
            'user_id' => $userId,
            'product_id' => $productId,
        ]);
    }

    public function exists(string $transactionId, string $paymentProvider): bool
    {
        return IAPTransaction::where('transaction_id', $transactionId)
            ->where('payment_provider', $paymentProvider)
            ->exists();
    }

    public function findByTransactionId(string $transactionId, string $paymentProvider): ?IAPTransaction
    {
        return IAPTransaction::where('transaction_id', $transactionId)
            ->where('payment_provider', $paymentProvider)
            ->first();
    }
}
