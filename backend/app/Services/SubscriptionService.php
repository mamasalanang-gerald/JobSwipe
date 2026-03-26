<?php

namespace App\Services;

use App\Exceptions\SubscriptionException;
use App\Models\PostgreSQL\Subscription;
use App\Models\PostgreSQL\User;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use Carbon\Carbon;
use Stripe\StripeClient;
use Throwable;

class SubscriptionService
{
    public const BASIC_TIER_AMOUNT = 120.00;

    public function __construct(
        private CompanyProfileRepository $companyProfiles,
    ) {}

    public function createCheckoutSession(User $user, string $successUrl, string $cancelUrl): array
    {
        if (! in_array($user->role, ['hr', 'company_admin'], true)) {
            throw new SubscriptionException('UNAUTHORIZED', 'Only company users can create subscriptions.', 403);
        }

        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        try {
            $stripe = $this->stripeClient();
            $priceId = (string) env('STRIPE_BASIC_PRICE_ID', '');

            $params = [
                'mode' => 'subscription',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'company_id' => $companyProfile->id,
                    'tier' => 'basic',
                ],
            ];

            if ($priceId !== '') {
                $params['line_items'] = [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]];
            } else {
                $params['line_items'] = [[
                    'price_data' => [
                        'currency' => 'php',
                        'product_data' => [
                            'name' => 'JobSwipe Basic Tier',
                        ],
                        'recurring' => [
                            'interval' => 'month',
                        ],
                        'unit_amount' => 12000,
                    ],
                    'quantity' => 1,
                ]];
            }

            $session = $stripe->checkout->sessions->create($params);

            return [
                'checkout_url' => (string) $session->url,
                'session_id' => (string) $session->id,
            ];
        } catch (Throwable $exception) {
            throw new SubscriptionException('SUBSCRIPTION_CHECKOUT_FAILED', $exception->getMessage(), 500);
        }
    }

    public function activateSubscription(User $user, ?string $providerSubscriptionId = null, string $stripeStatus = 'active'): void
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        $this->companyProfiles->update($companyProfile, [
            'subscription_tier' => 'basic',
            'subscription_status' => 'active',
        ]);

        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->where('payment_provider', 'stripe')
            ->latest('created_at')
            ->first();

        $payload = [
            'user_id' => $user->id,
            'subscriber_type' => 'company',
            'tier' => 'basic',
            'billing_cycle' => 'monthly',
            'amount_paid' => self::BASIC_TIER_AMOUNT,
            'currency' => 'PHP',
            'payment_provider' => 'stripe',
            'provider_sub_id' => $providerSubscriptionId,
            'status' => 'active',
            'stripe_status' => $stripeStatus,
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ];

        if ($subscription) {
            $subscription->update($payload);

            return;
        }

        Subscription::create($payload);
    }

    public function deactivateSubscription(User $user): void
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        $this->companyProfiles->update($companyProfile, [
            'subscription_status' => 'cancelled',
        ]);

        Subscription::query()
            ->where('user_id', $user->id)
            ->where('payment_provider', 'stripe')
            ->latest('created_at')
            ->limit(1)
            ->update([
                'status' => 'cancelled',
                'stripe_status' => 'canceled',
            ]);
    }

    public function handleSubscriptionUpdated(array $event): void
    {
        $eventType = (string) ($event['type'] ?? '');
        $object = $event['data']['object'] ?? [];

        if (! is_array($object)) {
            return;
        }

        if ($eventType === 'checkout.session.completed') {
            $metadata = $object['metadata'] ?? [];
            $userId = is_array($metadata) ? ($metadata['user_id'] ?? null) : null;
            $providerSubscriptionId = $object['subscription'] ?? null;

            if (is_string($userId) && $userId !== '') {
                $user = User::find($userId);
                if ($user) {
                    $this->activateSubscription(
                        $user,
                        is_string($providerSubscriptionId) ? $providerSubscriptionId : null,
                        'active'
                    );
                }
            }

            return;
        }

        if (! in_array($eventType, ['customer.subscription.updated', 'customer.subscription.deleted'], true)) {
            return;
        }

        $providerSubscriptionId = $object['id'] ?? null;

        if (! is_string($providerSubscriptionId) || $providerSubscriptionId === '') {
            return;
        }

        $status = $this->mapStripeStatus((string) ($object['status'] ?? 'inactive'));
        $stripeStatus = (string) ($object['status'] ?? 'inactive');

        $subscription = Subscription::query()
            ->where('provider_sub_id', $providerSubscriptionId)
            ->latest('created_at')
            ->first();

        if (! $subscription) {
            return;
        }

        $currentPeriodEnd = null;
        if (isset($object['current_period_end']) && is_int($object['current_period_end'])) {
            $currentPeriodEnd = Carbon::createFromTimestampUTC($object['current_period_end']);
        }

        $subscription->update(array_filter([
            'status' => $status,
            'stripe_status' => $stripeStatus,
            'current_period_end' => $currentPeriodEnd,
        ], static fn ($value) => $value !== null));

        $companyProfile = $this->companyProfiles->findByUserId((string) $subscription->user_id);

        if ($companyProfile) {
            $companySubscriptionStatus = match ($status) {
                'active' => 'active',
                'cancelled' => 'cancelled',
                default => 'inactive',
            };

            $this->companyProfiles->update($companyProfile, [
                'subscription_status' => $companySubscriptionStatus,
                'subscription_tier' => $companySubscriptionStatus === 'active' ? 'basic' : $companyProfile->subscription_tier,
            ]);
        }
    }

    public function canPostJobs(User $user): bool
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        return $companyProfile?->subscription_status === 'active';
    }

    public function getSubscriptionStatus(User $user): array
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        return [
            'tier' => $companyProfile->subscription_tier,
            'status' => $companyProfile->subscription_status,
            'can_post_jobs' => $companyProfile->subscription_status === 'active',
        ];
    }

    private function stripeClient(): StripeClient
    {
        $secret = (string) config('cashier.secret');

        if ($secret === '') {
            throw new SubscriptionException('STRIPE_NOT_CONFIGURED', 'Stripe secret key is missing.', 500);
        }

        return new StripeClient($secret);
    }

    private function mapStripeStatus(string $stripeStatus): string
    {
        return match ($stripeStatus) {
            'active', 'trialing' => 'active',
            'past_due', 'incomplete', 'incomplete_expired', 'unpaid' => 'past_due',
            'canceled' => 'cancelled',
            default => 'expired',
        };
    }
}
