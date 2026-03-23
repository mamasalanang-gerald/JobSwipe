<?php

namespace App\Models\PostgreSQL;

use Illuminate\Database\Eloquent\Model;

class PointEvent extends Model
{
    protected $connection = 'pgsql';

    protected $table = 'points_events';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'applicant_id', 'event_type', 'points', 'description',
    ];

    protected $casts = [
        'points' => 'integer',
        'created_at' => 'datetime',
    ];

    public function applicant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }
}
