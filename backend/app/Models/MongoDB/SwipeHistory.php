<?php

namespace App\Models\MongoDB;

use MongoDB\Laravel\Eloquent\Model;

class SwipeHistory extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'swipe_history';

    protected $fillable = [
        'user_id',
        'actor_type',
        'direction',
        'target_id',
        'target_type',
        'job_posting_id',
        'swiped_at',
        'meta',
    ];

    protected $casts = [
        'swiped_at' => 'datetime',
        'meta' => 'array',
    ];
}
