<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class JobPosting extends Model
{
    use Searchable;  // Meilisearch via Laravel Scout

    protected $connection = 'pgsql';

    protected $table = 'job_postings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'company_id', 'title', 'description', 'salary_min', 'salary_max',
        'salary_is_hidden', 'work_type', 'location', 'location_city',
        'location_region', 'lat', 'lng', 'interview_template',
        'status', 'expires_at', 'published_at',
    ];

    protected $casts = [
        'salary_is_hidden' => 'boolean',
        'expires_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(JobSkill::class, 'job_posting_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'job_posting_id');
    }

    // Meilisearch: define what gets indexed
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'work_type' => $this->work_type,
            'location_city' => $this->location_city,
            'location_region' => $this->location_region,
            'skills' => $this->skills->pluck('skill_name')->toArray(),
            '_geo' => $this->lat ? ['lat' => $this->lat, 'lng' => $this->lng] : null,
            'published_at' => $this->published_at?->timestamp,
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }
}
