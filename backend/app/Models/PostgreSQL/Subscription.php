<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'subscriptions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'subscriber_type', 'tier', 'billing_cycle',
        'amount_paid', 'currency', 'payment_provider', 'provider_sub_id',
        'provider_transaction_id', 'provider_receipt', 'provider_status',
        'status', 'stripe_status', 'subscription_type', 'auto_renew_enabled',
        'current_period_start', 'current_period_end',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'auto_renew_enabled' => 'boolean',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isExpired(): bool
    {
        return $this->current_period_end?->isPast() ?? false;
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeForType(Builder $query, string $type): Builder
    {
        return $query->where('subscription_type', $type);
    }

    public function scopeForProvider(Builder $query, string $provider): Builder
    {
        return $query->where('payment_provider', $provider);
    }

    public function scopeForUser(Builder $query, string $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
