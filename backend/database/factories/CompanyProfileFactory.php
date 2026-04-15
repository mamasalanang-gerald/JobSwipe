<?php

namespace Database\Factories;

use App\Models\PostgreSQL\CompanyProfile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CompanyProfile>
 */
class CompanyProfileFactory extends Factory
{
    protected $model = CompanyProfile::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid()->toString(),
            'user_id' => Str::uuid()->toString(),
            'owner_user_id' => null,
            'company_name' => fake()->company(),
            'company_domain' => fake()->unique()->domainName(),
            'is_free_email_domain' => false,
            'is_verified' => false,
            'verification_status' => 'unverified',
            'subscription_tier' => 'none',
            'subscription_status' => 'inactive',
            'trust_score' => 0,
            'trust_level' => 'untrusted',
            'listing_cap' => 0,
            'active_listings_count' => 0,
        ];
    }

    /**
     * Indicate the company is admin-approved and has a trust level allowing job posts.
     */
    public function verified(): static
    {
        return $this->state([
            'is_verified' => true,
            'verification_status' => 'approved',
            'trust_score' => 60,
            'trust_level' => 'established',
            'listing_cap' => 5,
        ]);
    }

    /**
     * Indicate verification is pending review.
     */
    public function pendingVerification(): static
    {
        return $this->state([
            'verification_status' => 'pending',
            'trust_score' => 20,
            'trust_level' => 'untrusted',
            'listing_cap' => 0,
        ]);
    }

    /**
     * Add an active subscription.
     */
    public function withSubscription(string $tier = 'basic'): static
    {
        return $this->state([
            'subscription_tier' => $tier,
            'subscription_status' => 'active',
        ]);
    }

    /**
     * Indicate the company uses a free email domain (gmail, yahoo, etc.).
     */
    public function freeEmailDomain(): static
    {
        return $this->state([
            'is_free_email_domain' => true,
            'company_domain' => null,
        ]);
    }

    /**
     * Set as a trusted company with high trust score.
     */
    public function trusted(): static
    {
        return $this->state([
            'is_verified' => true,
            'verification_status' => 'approved',
            'trust_score' => 85,
            'trust_level' => 'trusted',
            'listing_cap' => 15,
        ]);
    }
}
