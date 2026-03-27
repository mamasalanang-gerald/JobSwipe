<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApplicantProfile extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'applicant_profiles';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'total_points', 'subscription_tier', 'subscription_status',
        'daily_swipes_used', 'daily_swipe_limit', 'extra_swipe_balance', 'swipe_reset_at',
    ];

    protected $casts = [
        'swipe_reset_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'applicant_id');
    }

    public function pointEvents(): HasMany
    {
        return $this->hasMany(PointEvent::class, 'applicant_id');
    }

    public function isProSubscriber(): bool
    {
        return $this->subscription_tier === 'pro' && $this->subscription_status === 'active';
    }

    public function hasSwipesRemaining(): bool
    {
        return $this->daily_swipes_used < $this->daily_swipe_limit
            || $this->extra_swipe_balance > 0;
    }
}
