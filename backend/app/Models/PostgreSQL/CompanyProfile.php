<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'company_profiles';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'company_name', 'is_verified', 'verification_status',
        'subscription_tier', 'subscription_status', 'active_listings_count',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'active_listings_count' => 'integer',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jobPostings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JobPosting::class, 'company_id');
    }

    public function reviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CompanyReview::class, 'company_id');
    }

    public function isVerified(): bool
    {
        return $this->is_verified;
    }
}
