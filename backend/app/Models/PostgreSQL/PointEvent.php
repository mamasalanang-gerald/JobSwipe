<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointEvent extends Model
{
    use HasUuids;

    protected $connection = 'pgsql';

    protected $table = 'points_events';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id', 'event_type', 'points', 'description',
    ];

    protected $casts = [
        'points' => 'integer',
        'created_at' => 'datetime',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }
}
