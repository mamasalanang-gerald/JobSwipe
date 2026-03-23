<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;

class CompanyReview extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'company_reviews';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'applicant_id', 'company_id', 'job_posting_id',
        'rating', 'review_text', 'is_flagged', 'is_visible',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_flagged' => 'boolean',
        'is_visible' => 'boolean',
    ];

    public function applicant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function jobPosting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
