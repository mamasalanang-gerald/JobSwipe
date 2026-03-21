<?php

namespace App\Models\PostgreSQL;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'pgsql';

    protected $table = 'users';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'email', 'password_hash', 'role', 'is_active', 'is_banned', 'email_verified_at',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_banned' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function applicantProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ApplicantProfile::class, 'user_id');
    }

    public function companyProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CompanyProfile::class, 'user_id');
    }
}
