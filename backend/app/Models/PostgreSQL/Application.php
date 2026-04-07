<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'applications';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'applicant_id', 'job_posting_id', 'status', 'invitation_message', 'invited_at',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function matchRecord(): HasOne
    {
        return $this->hasOne(MatchRecord::class, 'application_id');
    }
}
