<?php

namespace App\Services;

use App\Exceptions\SubscriptionException;
use App\Models\PostgreSQL\Subscription;
use App\Models\PostgreSQL\User;
use App\Repositories\PostgreSQL\ApplicantProfileRepository;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use App\Services\Subscription\AppleIAPProvider;
use App\Services\Subscription\GooglePlayProvider;
use App\Services\Subscription\StripeProvider;
use App\Services\Subscription\SubscriptionProviderInterface;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Stripe\StripeClient;
use Throwable;

class SubscriptionService
{
    public const BASIC_TIER_AMOUNT = 120.00;

    private const CHECKOUT_IDEMPOTENCY_TTL_SECONDS = 86400;

    private const CHECKOUT_IDEMPOTENCY_PENDING_TIMEOUT_SECONDS = 30;

    /** @var array<string, SubscriptionProviderInterface> */
    private array $providers;

    public function __construct(
        private CompanyProfileRepository $companyProfiles,
        private ApplicantProfileRepository $applicantProfiles,
    ) {
        $this->providers = [
            'stripe' => new StripeProvider,
            'apple_iap' => new AppleIAPProvider,
            'google_play' => new GooglePlayProvider,
        ];
    }

    // =========================================================================
    // Existing Stripe Checkout Flow (kept for web-based verification badge)
    // =========================================================================

    public function createCheckoutSession(
        User $user,
        string $successUrl,
        string $cancelUrl,
        ?string $idempotencyKey = null
    ): array {
        if (! in_array($user->role, ['hr', 'company_admin'], true)) {
            throw new SubscriptionException('UNAUTHORIZED', 'Only company users can create subscriptions.', 403);
        }

        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        $reservation = null;

        try {
            $stripe = $this->stripeClient();
            $priceId = (string) config('services.stripe.basic_price_id', '');
            $resolvedIdempotencyKey = $this->resolveCheckoutIdempotencyKey($user->id, $successUrl, $cancelUrl, $idempotencyKey);
            $requestFingerprint = $this->buildCheckoutFingerprint($user->id, $successUrl, $cancelUrl, $priceId);

            $reservation = $this->reserveCheckoutRequest(
                $user->id,
                $resolvedIdempotencyKey,
                $requestFingerprint,
            );

            if ($reservation['status'] === 'cached') {
                return [
                    'checkout_url' => $reservation['checkout_url'],
                    'session_id' => $reservation['session_id'],
                    'idempotency_key' => $resolvedIdempotencyKey,
                    'idempotency_replayed' => true,
                ];
            }

            if ($reservation['status'] === 'in_progress') {
                throw new SubscriptionException(
                    'IDEMPOTENCY_KEY_IN_PROGRESS',
                    'A checkout request with this idempotency key is still processing. Retry shortly.',
                    409
                );
            }

            $params = [
                'mode' => 'subscription',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'company_id' => $companyProfile->id,
                    'tier' => 'basic',
                    'subscription_type' => 'verification',
                ],
            ];

            if ($priceId !== '') {
                $params['line_items'] = [
                    [
                        'price' => $priceId,
                        'quantity' => 1,
                    ],
                ];
            } else {
                $params['line_items'] = [
                    [
                        'price_data' => [
                            'currency' => 'php',
                            'product_data' => [
                                'name' => 'JobSwipe Verified',
                            ],
                            'recurring' => [
                                'interval' => 'month',
                            ],
                            'unit_amount' => 12000,
                        ],
                        'quantity' => 1,
                    ],
                ];
            }

            $session = $stripe->checkout->sessions->create($params, [
                'idempotency_key' => $resolvedIdempotencyKey,
            ]);

            $this->persistCheckoutResult(
                (int) $reservation['record_id'],
                (string) $session->id,
                (string) $session->url
            );

            return [
                'checkout_url' => (string) $session->url,
                'session_id' => (string) $session->id,
                'idempotency_key' => $resolvedIdempotencyKey,
                'idempotency_replayed' => false,
            ];
        } catch (SubscriptionException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            if (is_array($reservation) && isset($reservation['record_id'])) {
                $this->releaseCheckoutReservation((int) $reservation['record_id']);
            }

            throw new SubscriptionException('SUBSCRIPTION_CHECKOUT_FAILED', $exception->getMessage(), 500);
        }
    }

    // =========================================================================
    // Cross-Platform Subscription Methods
    // =========================================================================

    /**
     * Validate an IAP receipt/token from a mobile client.
     */
    public function validateIAPPurchase(User $user, string $provider, string $receiptOrToken, string $productId): array
    {
        $providerInstance = $this->getProvider($provider);
        $receipt = $providerInstance->validateReceipt($receiptOrToken, $productId);

        if (! $receipt->isActive()) {
            throw new SubscriptionException(
                'PURCHASE_NOT_ACTIVE',
                'The purchase is not in an active state.',
                400
            );
        }

        // Check if user can subscribe to this type
        $eligibility = $this->canSubscribe($user, $receipt->subscriptionType);

        if (! $eligibility['can_subscribe']) {
            throw new SubscriptionException(
                'ALREADY_SUBSCRIBED',
                $eligibility['reason'] ?? 'You already have an active subscription of this type.',
                409
            );
        }

        // Determine subscriber type from user role
        $subscriberType = in_array($user->role, ['hr', 'company_admin'], true) ? 'company' : 'applicant';

        // Calculate amount based on product mapping
        $amount = $this->resolveAmount($receipt->tier, $receipt->billingCycle);

        // Upsert subscription record
        Subscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'subscription_type' => $receipt->subscriptionType,
                'payment_provider' => $provider,
            ],
            [
                'subscriber_type' => $subscriberType,
                'tier' => $receipt->tier,
                'billing_cycle' => $receipt->billingCycle,
                'amount_paid' => $amount,
                'currency' => 'PHP',
                'provider_sub_id' => $receipt->providerTransactionId,
                'provider_transaction_id' => $receipt->providerTransactionId,
                'provider_receipt' => $receipt->rawReceipt,
                'provider_status' => $receipt->status,
                'status' => 'active',
                'auto_renew_enabled' => $receipt->autoRenewEnabled,
                'current_period_start' => now(),
                'current_period_end' => $receipt->expiresAt,
            ]
        );

        // Apply benefits to profile
        $this->applySubscriptionBenefits($user->id, $user->role, $receipt->tier, $receipt->subscriptionType);

        return [
            'status' => 'activated',
            'subscription_type' => $receipt->subscriptionType,
            'tier' => $receipt->tier,
            'provider' => $provider,
            'expires_at' => $receipt->expiresAt->toIso8601String(),
        ];
    }

    /**
     * Pre-purchase guard: check if user can subscribe to a given type.
     */
    public function canSubscribe(User $user, string $subscriptionType = 'subscription'): array
    {
        $existingActive = Subscription::query()
            ->forUser($user->id)
            ->forType($subscriptionType)
            ->active()
            ->first();

        if ($existingActive) {
            return [
                'can_subscribe' => false,
                'reason' => "You already have an active {$subscriptionType} on {$existingActive->payment_provider}.",
                'existing_provider' => $existingActive->payment_provider,
                'existing_tier' => $existingActive->tier,
            ];
        }

        // For verification: HR/company only
        if ($subscriptionType === 'verification') {
            if (! in_array($user->role, ['hr', 'company_admin'], true)) {
                return [
                    'can_subscribe' => false,
                    'reason' => 'Only company users can purchase a verification badge.',
                ];
            }
        }

        return [
            'can_subscribe' => true,
            'reason' => null,
        ];
    }

    /**
     * Unified subscription status across all providers.
     */
    public function getUnifiedSubscriptionStatus(User $user): array
    {
        $subscriptions = Subscription::query()
            ->forUser($user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $isCompany = in_array($user->role, ['hr', 'company_admin'], true);

        $result = [
            'role' => $user->role,
            'subscriptions' => [],
        ];

        if ($isCompany) {
            $companyProfile = $this->companyProfiles->findByUserId($user->id);
            $result['verification'] = [
                'status' => 'inactive',
                'tier' => null,
                'provider' => null,
                'can_post_jobs' => false,
            ];
            $result['gold'] = [
                'status' => 'inactive',
                'tier' => null,
                'provider' => null,
            ];
            $result['is_verified'] = $companyProfile?->is_verified ?? false;
        } else {
            $applicantProfile = $this->applicantProfiles->findByUserId($user->id);
            $result['subscription_tier'] = $applicantProfile?->subscription_tier ?? 'free';
            $result['daily_swipe_limit'] = $applicantProfile?->daily_swipe_limit ?? 15;
        }

        foreach ($subscriptions as $sub) {
            $entry = [
                'id' => $sub->id,
                'type' => $sub->subscription_type,
                'tier' => $sub->tier,
                'status' => $sub->status,
                'provider' => $sub->payment_provider,
                'billing_cycle' => $sub->billing_cycle,
                'auto_renew' => $sub->auto_renew_enabled,
                'current_period_end' => $sub->current_period_end?->toIso8601String(),
            ];

            $result['subscriptions'][] = $entry;

            // Populate convenience fields for active subs
            if ($sub->status === 'active' && $isCompany) {
                if ($sub->subscription_type === 'verification') {
                    $result['verification'] = [
                        'status' => 'active',
                        'tier' => $sub->tier,
                        'provider' => $sub->payment_provider,
                        'can_post_jobs' => true,
                    ];
                } elseif ($sub->subscription_type === 'subscription') {
                    $result['gold'] = [
                        'status' => 'active',
                        'tier' => $sub->tier,
                        'provider' => $sub->payment_provider,
                    ];
                }
            }
        }

        return $result;
    }

    /**
     * Apply subscription benefits to the user's profile.
     */
    public function applySubscriptionBenefits(string $userId, string $role, string $tier, string $subscriptionType): void
    {
        $isCompany = in_array($role, ['hr', 'company_admin'], true);

        if ($isCompany) {
            $companyProfile = $this->companyProfiles->findByUserId($userId);

            if (! $companyProfile) {
                return;
            }

            if ($subscriptionType === 'verification') {
                $this->companyProfiles->update($companyProfile, [
                    'subscription_status' => 'active',
                    'subscription_tier' => 'basic',
                    'is_verified' => true,
                    'verification_status' => 'approved',
                ]);
            } elseif ($subscriptionType === 'subscription') {
                $this->companyProfiles->update($companyProfile, [
                    'subscription_tier' => 'pro',
                ]);
            }
        } else {
            $applicantProfile = $this->applicantProfiles->findByUserId($userId);

            if (! $applicantProfile) {
                return;
            }

            $this->applicantProfiles->update($applicantProfile, [
                'subscription_tier' => $tier,
                'subscription_status' => 'active',
                'daily_swipe_limit' => 999999,
            ]);
        }
    }

    /**
     * Revoke subscription benefits from the user's profile.
     */
    public function revokeSubscriptionBenefits(string $userId, string $role, string $subscriptionType): void
    {
        $isCompany = in_array($role, ['hr', 'company_admin'], true);

        if ($isCompany) {
            $companyProfile = $this->companyProfiles->findByUserId($userId);

            if (! $companyProfile) {
                return;
            }

            if ($subscriptionType === 'verification') {
                // Check if there's still an active verification from another provider
                $otherActive = Subscription::query()
                    ->forUser($userId)
                    ->forType('verification')
                    ->active()
                    ->exists();

                if (! $otherActive) {
                    $this->companyProfiles->update($companyProfile, [
                        'subscription_status' => 'cancelled',
                        'is_verified' => false,
                        'verification_status' => 'unverified',
                    ]);
                }
            } elseif ($subscriptionType === 'subscription') {
                $otherActive = Subscription::query()
                    ->forUser($userId)
                    ->forType('subscription')
                    ->active()
                    ->exists();

                if (! $otherActive) {
                    $this->companyProfiles->update($companyProfile, [
                        'subscription_tier' => 'basic',
                    ]);
                }
            }
        } else {
            $applicantProfile = $this->applicantProfiles->findByUserId($userId);

            if (! $applicantProfile) {
                return;
            }

            // Check if there's still an active sub from another provider
            $otherActive = Subscription::query()
                ->forUser($userId)
                ->forType('subscription')
                ->active()
                ->exists();

            if (! $otherActive) {
                $this->applicantProfiles->update($applicantProfile, [
                    'subscription_tier' => 'free',
                    'subscription_status' => 'inactive',
                    'daily_swipe_limit' => 15,
                ]);
            }
        }
    }

    /**
     * Handle a provider notification/webhook.
     */
    public function handleProviderNotification(string $providerName, array $payload): void
    {
        $provider = $this->getProvider($providerName);
        $event = $provider->handleNotification($payload);

        if ($event === null) {
            return;
        }

        // Find the subscription by provider transaction ID
        $subscription = Subscription::query()
            ->where('provider_transaction_id', $event->providerTransactionId)
            ->orWhere('provider_sub_id', $event->providerTransactionId)
            ->latest('created_at')
            ->first();

        if (! $subscription) {
            return;
        }

        $user = User::find($subscription->user_id);

        if (! $user) {
            return;
        }

        if ($event->isActivation()) {
            $subscription->update(array_filter([
                'status' => 'active',
                'auto_renew_enabled' => $event->autoRenewEnabled,
                'current_period_end' => $event->expiresAt,
            ], static fn ($v) => $v !== null));

            $this->applySubscriptionBenefits(
                $user->id,
                $user->role,
                $subscription->tier,
                $subscription->subscription_type
            );
        } elseif ($event->isCancellation()) {
            $subscription->update([
                'status' => 'cancelled',
                'auto_renew_enabled' => false,
            ]);

            $this->revokeSubscriptionBenefits(
                $user->id,
                $user->role,
                $subscription->subscription_type
            );
        } elseif ($event->isExpiration()) {
            $subscription->update([
                'status' => 'expired',
                'auto_renew_enabled' => false,
            ]);

            $this->revokeSubscriptionBenefits(
                $user->id,
                $user->role,
                $subscription->subscription_type
            );
        }
    }

    // =========================================================================
    // Refactored existing methods (now use unified benefits)
    // =========================================================================

    public function activateSubscription(User $user, ?string $providerSubscriptionId = null, string $stripeStatus = 'active'): void
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

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
            'subscription_type' => 'verification',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ];

        if ($subscription) {
            $subscription->update($payload);
        } else {
            Subscription::create($payload);
        }

        // Use unified benefit application
        $this->applySubscriptionBenefits($user->id, $user->role, 'basic', 'verification');
    }

    public function deactivateSubscription(User $user): void
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        if (! $companyProfile) {
            throw new SubscriptionException('COMPANY_PROFILE_NOT_FOUND', 'Company profile not found.', 404);
        }

        Subscription::query()
            ->where('user_id', $user->id)
            ->where('payment_provider', 'stripe')
            ->latest('created_at')
            ->limit(1)
            ->update([
                'status' => 'cancelled',
                'stripe_status' => 'canceled',
            ]);

        // Use unified benefit revocation
        $this->revokeSubscriptionBenefits($user->id, $user->role, 'verification');
    }

    public function handleSubscriptionUpdated(array $event): void
    {
        $eventId = (string) ($event['id'] ?? '');
        $eventType = (string) ($event['type'] ?? '');
        $object = $event['data']['object'] ?? [];

        if ($eventId === '' || ! is_array($object)) {
            return;
        }

        if (! $this->reserveWebhookEvent($eventId, $eventType)) {
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

        $stripeProvider = $this->getProvider('stripe');
        $status = $stripeProvider->mapStripeStatus((string) ($object['status'] ?? 'inactive'));
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

        $user = User::find($subscription->user_id);

        if ($user) {
            if ($status === 'active') {
                $this->applySubscriptionBenefits(
                    $user->id,
                    $user->role,
                    $subscription->tier,
                    $subscription->subscription_type ?? 'verification'
                );
            } else {
                $this->revokeSubscriptionBenefits(
                    $user->id,
                    $user->role,
                    $subscription->subscription_type ?? 'verification'
                );
            }
        }
    }

    public function canPostJobs(User $user): bool
    {
        $companyProfile = $this->companyProfiles->findByUserId($user->id);

        return $companyProfile?->subscription_status === 'active';
    }

    public function getSubscriptionStatus(User $user): array
    {
        return $this->getUnifiedSubscriptionStatus($user);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private function getProvider(string $name): SubscriptionProviderInterface
    {
        if ($name === 'stripe') {
            return $this->providers['stripe'];
        }

        if (! isset($this->providers[$name])) {
            throw new SubscriptionException(
                'INVALID_PROVIDER',
                "Unknown payment provider: {$name}",
                400
            );
        }

        return $this->providers[$name];
    }

    private function resolveAmount(string $tier, string $billingCycle): float
    {
        return match (true) {
            $tier === 'basic' => 120.00,
            $tier === 'pro' && $billingCycle === 'monthly' => 200.00,
            $tier === 'pro' && $billingCycle === 'yearly' => 2000.00,
            default => 0.00,
        };
    }

    private function stripeClient(): StripeClient
    {
        $secret = (string) (config('services.stripe.secret') ?: config('cashier.secret', ''));

        if ($secret === '') {
            throw new SubscriptionException('STRIPE_NOT_CONFIGURED', 'Stripe secret key is missing.', 500);
        }

        return new StripeClient($secret);
    }

    private function resolveCheckoutIdempotencyKey(
        string $userId,
        string $successUrl,
        string $cancelUrl,
        ?string $idempotencyKey
    ): string {
        $providedKey = trim((string) $idempotencyKey);

        if ($providedKey !== '') {
            return Str::limit($providedKey, 255, '');
        }

        $window = (string) floor(now()->timestamp / 600);

        return hash('sha256', implode('|', [
            $userId,
            'basic',
            hash('sha256', $successUrl),
            hash('sha256', $cancelUrl),
            $window,
        ]));
    }

    private function buildCheckoutFingerprint(
        string $userId,
        string $successUrl,
        string $cancelUrl,
        string $priceId
    ): string {
        return hash('sha256', implode('|', [
            $userId,
            $successUrl,
            $cancelUrl,
            $priceId,
            'basic',
            'monthly',
        ]));
    }

    private function reserveCheckoutRequest(
        string $userId,
        string $idempotencyKey,
        string $requestFingerprint
    ): array {
        $expiresAt = now()->addSeconds($this->checkoutIdempotencyTtlSeconds());

        return DB::transaction(function () use ($userId, $idempotencyKey, $requestFingerprint, $expiresAt) {
            DB::table('stripe_checkout_idempotency_keys')->insertOrIgnore([
                'user_id' => $userId,
                'idempotency_key' => $idempotencyKey,
                'request_fingerprint' => $requestFingerprint,
                'expires_at' => $expiresAt,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $record = DB::table('stripe_checkout_idempotency_keys')
                ->where('idempotency_key', $idempotencyKey)
                ->lockForUpdate()
                ->first();

            if (! $record) {
                throw new SubscriptionException(
                    'IDEMPOTENCY_RESERVATION_FAILED',
                    'Unable to reserve checkout idempotency key.',
                    500
                );
            }

            if ($record->expires_at !== null && Carbon::parse((string) $record->expires_at)->isPast()) {
                DB::table('stripe_checkout_idempotency_keys')
                    ->where('id', $record->id)
                    ->update([
                        'user_id' => $userId,
                        'request_fingerprint' => $requestFingerprint,
                        'session_id' => null,
                        'checkout_url' => null,
                        'expires_at' => $expiresAt,
                        'updated_at' => now(),
                    ]);

                return [
                    'status' => 'reserved',
                    'record_id' => (int) $record->id,
                ];
            }

            if ((string) $record->user_id !== $userId || (string) $record->request_fingerprint !== $requestFingerprint) {
                throw new SubscriptionException(
                    'IDEMPOTENCY_KEY_REUSED',
                    'Idempotency key already used with a different request payload.',
                    409
                );
            }

            if ($record->session_id !== null && $record->checkout_url !== null) {
                return [
                    'status' => 'cached',
                    'record_id' => (int) $record->id,
                    'session_id' => (string) $record->session_id,
                    'checkout_url' => (string) $record->checkout_url,
                ];
            }

            if ($record->updated_at !== null && Carbon::parse((string) $record->updated_at)->gt(now()->subSeconds(self::CHECKOUT_IDEMPOTENCY_PENDING_TIMEOUT_SECONDS))) {
                return [
                    'status' => 'in_progress',
                    'record_id' => (int) $record->id,
                ];
            }

            DB::table('stripe_checkout_idempotency_keys')
                ->where('id', $record->id)
                ->update([
                    'expires_at' => $expiresAt,
                    'updated_at' => now(),
                ]);

            return [
                'status' => 'reserved',
                'record_id' => (int) $record->id,
            ];
        }, 3);
    }

    private function persistCheckoutResult(int $recordId, string $sessionId, string $checkoutUrl): void
    {
        DB::table('stripe_checkout_idempotency_keys')
            ->where('id', $recordId)
            ->update([
                'session_id' => $sessionId,
                'checkout_url' => $checkoutUrl,
                'expires_at' => now()->addSeconds($this->checkoutIdempotencyTtlSeconds()),
                'updated_at' => now(),
            ]);
    }

    private function releaseCheckoutReservation(int $recordId): void
    {
        DB::table('stripe_checkout_idempotency_keys')
            ->where('id', $recordId)
            ->whereNull('session_id')
            ->delete();
    }

    private function checkoutIdempotencyTtlSeconds(): int
    {
        return max((int) config('services.stripe.checkout_idempotency_ttl_seconds', self::CHECKOUT_IDEMPOTENCY_TTL_SECONDS), 300);
    }

    private function reserveWebhookEvent(string $eventId, string $eventType): bool
    {
        try {
            DB::table('stripe_webhook_events')->insert([
                'stripe_event_id' => $eventId,
                'event_type' => $eventType,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return true;
        } catch (QueryException $exception) {
            $sqlState = $exception->errorInfo[0] ?? null;

            if (in_array($sqlState, ['23000', '23505'], true)) {
                return false;
            }

            throw $exception;
        }
    }
}
