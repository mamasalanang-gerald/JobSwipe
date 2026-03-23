<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'subscriptions';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'subscriber_type', 'tier', 'billing_cycle',
        'amount_paid', 'currency', 'payment_provider', 'provider_sub_id',
        'status', 'current_period_start', 'current_period_end',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
