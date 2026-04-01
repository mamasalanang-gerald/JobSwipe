<?php

namespace App\Services\IAP;

use App\Models\PostgreSQL\ApplicantProfile;
use App\Models\PostgreSQL\SwipePack;
use App\Repositories\PostgreSQL\ApplicantProfileRepository;
use App\Repositories\PostgreSQL\SwipePackRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SwipePackManager
{
    public function __construct(
        private SwipePackRepository $swipePacks,
        private ApplicantProfileRepository $applicantProfiles,
    ) {}

    /**
     * Process swipe pack purchase
     */
    public function purchase(
        ApplicantProfile $applicant,
        int $quantity,
        string $paymentProvider,
        string $providerPaymentId,
        float $amountPaid,
        string $currency = 'PHP'
    ): SwipePack {
        return DB::transaction(function () use (
            $applicant,
            $quantity,
            $paymentProvider,
            $providerPaymentId,
            $amountPaid,
            $currency
        ) {
            // Create swipe pack record
            $swipePack = $this->swipePacks->create([
                'applicant_id' => $applicant->id,
                'quantity' => $quantity,
                'amount_paid' => $amountPaid,
                'currency' => $currency,
                'payment_provider' => $paymentProvider,
                'provider_payment_id' => $providerPaymentId,
            ]);

            // Increment applicant extra_swipe_balance
            $this->applicantProfiles->update($applicant, [
                'extra_swipe_balance' => $applicant->extra_swipe_balance + $quantity,
            ]);

            Log::info('Swipe pack purchased', [
                'applicant_id' => $applicant->id,
                'user_id' => $applicant->user_id,
                'quantity' => $quantity,
                'payment_provider' => $paymentProvider,
                'provider_payment_id' => $providerPaymentId,
                'new_balance' => $applicant->extra_swipe_balance + $quantity,
            ]);

            return $swipePack;
        });
    }

    /**
     * Process swipe pack refund
     */
    public function refund(string $transactionId): void
    {
        DB::transaction(function () use ($transactionId) {
            $swipePack = $this->swipePacks->findByTransactionId($transactionId);

            if (! $swipePack) {
                Log::warning('Swipe pack not found for refund', [
                    'transaction_id' => $transactionId,
                ]);

                return;
            }

            // Get applicant profile
            $applicant = $this->applicantProfiles->findById($swipePack->applicant_id);

            if (! $applicant) {
                Log::warning('Applicant not found for swipe pack refund', [
                    'applicant_id' => $swipePack->applicant_id,
                    'transaction_id' => $transactionId,
                ]);

                return;
            }

            // Deduct quantity from extra_swipe_balance (set to 0 if would be negative)
            $newBalance = max(0, $applicant->extra_swipe_balance - $swipePack->quantity);

            $this->applicantProfiles->update($applicant, [
                'extra_swipe_balance' => $newBalance,
            ]);

            Log::warning('Swipe pack refunded', [
                'applicant_id' => $applicant->id,
                'user_id' => $applicant->user_id,
                'transaction_id' => $transactionId,
                'quantity_refunded' => $swipePack->quantity,
                'old_balance' => $applicant->extra_swipe_balance,
                'new_balance' => $newBalance,
            ]);
        });
    }
}
