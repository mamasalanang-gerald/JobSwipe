<?php

namespace App\Models\PostgreSQL;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'pgsql';

    protected $table = 'users';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'email',
        'password_hash',
        'role',
        'is_active',
        'is_banned',
        'email_verified_at',
        'google_id',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_banned' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function applicantProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ApplicantProfile::class, 'user_id');
    }

    public function companyProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CompanyProfile::class, 'user_id');
    }

    public function isApplicant(): bool
    {
        return $this->role === 'applicant';
    }

    public function isHr(): bool
    {
        return in_array($this->role, ['hr', 'company_admin'], true);
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }
}
