# JobSwipe — Laravel Architecture Guide
> **Stack:** Laravel 11 · PostgreSQL 16 · MongoDB 7 (mongodb/laravel-mongodb) · Redis 7  
> **Pattern:** MVC + Service Layer + Repository Layer

---

## Table of Contents

1. [Directory Structure](#1-directory-structure)
2. [Package Setup](#2-package-setup)
3. [Database Connections](#3-database-connections)
4. [Migrations (PostgreSQL)](#4-migrations-postgresql)
5. [Models](#5-models)
6. [Repositories](#6-repositories)
7. [Services](#7-services)
8. [Controllers](#8-controllers)
9. [Binding It Together (AppServiceProvider)](#9-binding-it-together-appserviceprovider)
10. [Jobs & Notifications](#10-jobs--notifications)
11. [Request Validation](#11-request-validation)
12. [Routes](#12-routes)

---

## 1. Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Applicant/
│   │   │   ├── SwipeController.php
│   │   │   ├── ApplicationController.php
│   │   │   └── ProfileController.php
│   │   ├── Company/
│   │   │   ├── JobPostingController.php
│   │   │   └── ApplicantReviewController.php
│   │   ├── Auth/
│   │   │   └── AuthController.php
│   │   └── Admin/
│   │       └── VerificationController.php
│   ├── Requests/
│   │   ├── Applicant/
│   │   │   └── SwipeRequest.php
│   │   └── Company/
│   │       └── CreateJobPostingRequest.php
│   └── Middleware/
│       └── EnforceSwipeLimit.php
│
├── Models/
│   ├── Postgres/           # Eloquent (PostgreSQL)
│   │   ├── User.php
│   │   ├── ApplicantProfile.php
│   │   ├── CompanyProfile.php
│   │   ├── JobPosting.php
│   │   ├── Application.php
│   │   ├── Subscription.php
│   │   ├── PointEvent.php
│   │   ├── CompanyReview.php
│   │   └── Notification.php
│   └── Mongo/              # MongoDB (mongodb/laravel-mongodb)
│       ├── ApplicantProfileDocument.php
│       ├── CompanyProfileDocument.php
│       └── SwipeHistory.php
│
├── Repositories/
│   ├── Contracts/
│   │   ├── SwipeRepositoryInterface.php
│   │   └── ApplicationRepositoryInterface.php
│   ├── Postgres/
│   │   ├── ApplicationRepository.php
│   │   └── ApplicantProfileRepository.php
│   ├── Mongo/
│   │   └── SwipeHistoryRepository.php
│   └── Redis/
│       └── SwipeCacheRepository.php
│
├── Services/
│   ├── SwipeService.php
│   ├── PointService.php
│   ├── DeckService.php
│   └── InvitationService.php
│
├── Jobs/
│   ├── SendInterviewInvitation.php
│   └── RecalculateApplicantPoints.php
│
└── Providers/
    └── AppServiceProvider.php

database/
└── migrations/
    ├── 2026_01_01_000001_create_users_table.php
    ├── 2026_01_01_000002_create_applicant_profiles_table.php
    └── ...
```

> **Why Service + Repository on top of MVC?**  
> Controllers should only handle HTTP — read the request, call a service, return a response.  
> Services own business logic (e.g. "process a swipe") and orchestrate across multiple stores.  
> Repositories own data access per store. This keeps each layer testable in isolation and prevents multi-DB logic from bleeding into controllers.

---

## 2. Package Setup

```bash
# MongoDB driver for Laravel
composer require mongodb/laravel-mongodb

# Laravel Sanctum (auth)
composer require laravel/sanctum

# Laravel Cashier (Stripe)
composer require laravel/cashier

# Laravel Horizon (Redis queues)
composer require laravel/horizon

# Laravel Scout + Meilisearch driver
composer require laravel/scout
composer require meilisearch/meilisearch-php http-interop/http-factory-guzzle
```

---

## 3. Database Connections

### `config/database.php`

```php
'connections' => [

    // PostgreSQL — transactional data
    'pgsql' => [
        'driver'   => 'pgsql',
        'host'     => env('DB_HOST', '127.0.0.1'),
        'port'     => env('DB_PORT', '5432'),
        'database' => env('DB_DATABASE', 'jobswipe'),
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
        'charset'  => 'utf8',
        'schema'   => 'public',
    ],

    // MongoDB — profiles + swipe history
    'mongodb' => [
        'driver'   => 'mongodb',
        'dsn'      => env('MONGODB_URI'),
        'database' => env('MONGODB_DATABASE', 'jobswipe'),
    ],

],

'default' => 'pgsql',  // PostgreSQL is the default
```

### `config/cache.php` / `config/queue.php`

```php
// cache.php — Redis as default cache driver
'default' => env('CACHE_DRIVER', 'redis'),

// queue.php — Redis via Horizon
'default' => env('QUEUE_CONNECTION', 'redis'),
```

---

## 4. Migrations (PostgreSQL)

Each table gets its own migration. Below are the most critical ones.

### `create_users_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('role', 20);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_banned')->default(false);
            $table->timestampTz('email_verified_at')->nullable();
            $table->timestampsTz();

            $table->check("role IN ('applicant','hr','company_admin','moderator','super_admin')");
        });

        // Partial index: only index banned users
        DB::statement("CREATE INDEX idx_users_is_banned ON users (is_banned) WHERE is_banned = TRUE");
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### `create_applicant_profiles_table`

```php
return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id')->unique();
            $table->integer('total_points')->default(0);
            $table->string('subscription_tier', 10)->default('free');
            $table->string('subscription_status', 15)->default('inactive');
            $table->integer('daily_swipes_used')->default(0);
            $table->integer('daily_swipe_limit')->default(15);
            $table->integer('extra_swipes_balance')->default(0);
            $table->date('swipe_reset_at')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // Composite index for HR applicant queue priority ordering
        DB::statement('CREATE INDEX idx_applicant_profiles_queue ON applicant_profiles (subscription_tier, total_points DESC)');
        DB::statement("CREATE INDEX idx_applicant_profiles_active_sub ON applicant_profiles (subscription_status) WHERE subscription_status = 'active'");
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_profiles');
    }
};
```

### `create_applications_table`

```php
return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('applicant_id');
            $table->uuid('job_posting_id');
            $table->string('status', 10)->default('applied');
            $table->text('invitation_message')->nullable();
            $table->timestampTz('invited_at')->nullable();
            $table->timestampsTz();

            $table->foreign('applicant_id')->references('id')->on('applicant_profiles');
            $table->foreign('job_posting_id')->references('id')->on('job_postings');

            // One application per applicant per posting
            $table->unique(['applicant_id', 'job_posting_id']);
        });

        DB::statement('CREATE INDEX idx_applications_job_posting_id ON applications (job_posting_id)');
        DB::statement('CREATE INDEX idx_applications_job_status ON applications (job_posting_id, status)');
        DB::statement('CREATE INDEX idx_applications_applicant_id ON applications (applicant_id, created_at DESC)');
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
```

### `create_point_events_table`

```php
return new class extends Migration
{
    protected $connection = 'pgsql';

    public function up(): void
    {
        Schema::create('point_events', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('applicant_id');
            $table->string('event_type', 50);
            $table->integer('points');
            $table->string('description', 255)->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));

            $table->foreign('applicant_id')->references('id')->on('applicant_profiles');
        });

        DB::statement('CREATE INDEX idx_point_events_applicant_id ON point_events (applicant_id, created_at DESC)');

        // Partial unique index: one-time events cannot be repeated
        DB::statement("
            CREATE UNIQUE INDEX idx_point_events_onetime
            ON point_events (applicant_id, event_type)
            WHERE event_type NOT IN ('subscribed_basic', 'subscribed_pro', 'bonus_pro')
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('point_events');
    }
};
```

---

## 5. Models

### PostgreSQL Models (`app/Models/Postgres/`)

#### `User.php`

```php
<?php

namespace App\Models\Postgres;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'pgsql';
    protected $table      = 'users';
    public    $incrementing = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'email', 'password_hash', 'role', 'is_active', 'is_banned', 'email_verified_at',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_active'         => 'boolean',
        'is_banned'         => 'boolean',
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
```

#### `ApplicantProfile.php`

```php
<?php

namespace App\Models\Postgres;

use Illuminate\Database\Eloquent\Model;

class ApplicantProfile extends Model
{
    protected $connection   = 'pgsql';
    protected $table        = 'applicant_profiles';
    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $fillable = [
        'user_id', 'total_points', 'subscription_tier', 'subscription_status',
        'daily_swipes_used', 'daily_swipe_limit', 'extra_swipes_balance', 'swipe_reset_at',
    ];

    protected $casts = [
        'swipe_reset_at' => 'date',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class, 'applicant_id');
    }

    public function pointEvents(): \Illuminate\Database\Eloquent\Relations\HasMany
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
            || $this->extra_swipes_balance > 0;
    }
}
```

#### `JobPosting.php`

```php
<?php

namespace App\Models\Postgres;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class JobPosting extends Model
{
    use Searchable;  // Meilisearch via Laravel Scout

    protected $connection   = 'pgsql';
    protected $table        = 'job_postings';
    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $fillable = [
        'company_id', 'title', 'description', 'salary_min', 'salary_max',
        'salary_is_hidden', 'work_type', 'location', 'location_city',
        'location_region', 'lat', 'lng', 'interview_template',
        'status', 'expires_at', 'published_at',
    ];

    protected $casts = [
        'salary_is_hidden' => 'boolean',
        'expires_at'       => 'datetime',
        'published_at'     => 'datetime',
    ];

    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function skills(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JobSkill::class, 'job_posting_id');
    }

    public function applications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Application::class, 'job_posting_id');
    }

    // Meilisearch: define what gets indexed
    public function toSearchableArray(): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'description'     => $this->description,
            'work_type'       => $this->work_type,
            'location_city'   => $this->location_city,
            'location_region' => $this->location_region,
            'skills'          => $this->skills->pluck('skill_name')->toArray(),
            '_geo'            => $this->lat ? ['lat' => $this->lat, 'lng' => $this->lng] : null,
            'published_at'    => $this->published_at?->timestamp,
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }
}
```

#### `Application.php`

```php
<?php

namespace App\Models\Postgres;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $connection   = 'pgsql';
    protected $table        = 'applications';
    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $fillable = [
        'applicant_id', 'job_posting_id', 'status', 'invitation_message', 'invited_at',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
    ];

    public function applicant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }

    public function jobPosting(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
```

---

### MongoDB Models (`app/Models/Mongo/`)

#### `SwipeHistory.php`

```php
<?php

namespace App\Models\Mongo;

use MongoDB\Laravel\Eloquent\Model;

class SwipeHistory extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'swipe_history';

    protected $fillable = [
        'user_id', 'actor_type', 'direction',
        'target_id', 'target_type', 'job_posting_id',
        'swiped_at', 'meta',
    ];

    protected $casts = [
        'swiped_at' => 'datetime',
        'meta'      => 'array',
    ];
}
```

#### `ApplicantProfileDocument.php`

```php
<?php

namespace App\Models\Mongo;

use MongoDB\Laravel\Eloquent\Model;

class ApplicantProfileDocument extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'applicant_profiles';

    protected $fillable = [
        'user_id', 'first_name', 'last_name', 'profile_photo_url',
        'bio', 'location', 'location_city', 'location_region',
        'linkedin_url', 'social_links', 'resume_url', 'cover_letter_url',
        'portfolio_url', 'skills', 'work_experience', 'education',
        'completed_profile_fields',
    ];

    protected $casts = [
        'skills'                   => 'array',
        'work_experience'          => 'array',
        'education'                => 'array',
        'social_links'             => 'array',
        'completed_profile_fields' => 'array',
    ];
}
```

---

## 6. Repositories

Repositories isolate data access per store. The Service layer calls repositories — never raw queries directly from a controller or service.

### `app/Repositories/Mongo/SwipeHistoryRepository.php`

```php
<?php

namespace App\Repositories\Mongo;

use App\Models\Mongo\SwipeHistory;
use Carbon\Carbon;

class SwipeHistoryRepository
{
    public function record(
        string $userId,
        string $actorType,
        string $direction,
        string $targetId,
        string $targetType,
        ?string $jobPostingId,
        array $meta = []
    ): SwipeHistory {
        return SwipeHistory::create([
            'user_id'        => $userId,
            'actor_type'     => $actorType,
            'direction'      => $direction,
            'target_id'      => $targetId,
            'target_type'    => $targetType,
            'job_posting_id' => $jobPostingId,
            'swiped_at'      => now(),
            'meta'           => $meta,
        ]);
    }

    public function hasSwiped(string $userId, string $targetId, string $targetType): bool
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('target_id', $targetId)
            ->where('target_type', $targetType)
            ->exists();
    }

    public function countTodaySwipes(string $userId): int
    {
        $startOfDay = Carbon::now('Asia/Manila')->startOfDay()->utc();

        return SwipeHistory::where('user_id', $userId)
            ->where('actor_type', 'applicant')
            ->where('swiped_at', '>=', $startOfDay)
            ->count();
    }

    public function getSeenJobIds(string $userId): array
    {
        return SwipeHistory::where('user_id', $userId)
            ->where('actor_type', 'applicant')
            ->pluck('target_id')
            ->toArray();
    }

    public function getSeenApplicantIds(string $hrUserId, string $jobPostingId): array
    {
        return SwipeHistory::where('user_id', $hrUserId)
            ->where('actor_type', 'hr')
            ->where('job_posting_id', $jobPostingId)
            ->pluck('target_id')
            ->toArray();
    }
}
```

### `app/Repositories/Redis/SwipeCacheRepository.php`

```php
<?php

namespace App\Repositories\Redis;

use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;

class SwipeCacheRepository
{
    // ── Counter ────────────────────────────────────────────────────────────

    private function counterKey(string $userId): string
    {
        $date = Carbon::now('Asia/Manila')->toDateString();
        return "swipe:counter:{$userId}:{$date}";
    }

    public function getCounter(string $userId): ?int
    {
        $val = Redis::get($this->counterKey($userId));
        return $val !== null ? (int) $val : null;
    }

    public function incrementCounter(string $userId): int
    {
        $key    = $this->counterKey($userId);
        $count  = Redis::incr($key);

        // Set TTL to midnight PHT if this is the first increment
        if ($count === 1) {
            $secondsUntilMidnight = Carbon::now('Asia/Manila')->secondsUntilEndOfDay();
            Redis::expire($key, $secondsUntilMidnight);
        }

        return $count;
    }

    public function rehydrateCounter(string $userId, int $count): void
    {
        $key                  = $this->counterKey($userId);
        $secondsUntilMidnight = Carbon::now('Asia/Manila')->secondsUntilEndOfDay();
        Redis::set($key, $count, 'EX', $secondsUntilMidnight);
    }

    // ── Applicant deck dedup ────────────────────────────────────────────────

    private function deckSeenKey(string $userId): string
    {
        return "swipe:deck:seen:{$userId}";
    }

    public function hasSeenJob(string $userId, string $jobId): ?bool
    {
        // Returns null if key doesn't exist (cache miss), true/false otherwise
        if (!Redis::exists($this->deckSeenKey($userId))) {
            return null; // trigger fallback
        }
        return (bool) Redis::sismember($this->deckSeenKey($userId), $jobId);
    }

    public function markJobSeen(string $userId, string $jobId): void
    {
        $key = $this->deckSeenKey($userId);
        Redis::sadd($key, $jobId);
        Redis::expire($key, 90 * 86400);
    }

    public function rehydrateDeckSeen(string $userId, array $jobIds): void
    {
        if (empty($jobIds)) return;
        $key = $this->deckSeenKey($userId);
        Redis::sadd($key, ...$jobIds);
        Redis::expire($key, 90 * 86400);
    }

    // ── HR applicant dedup ─────────────────────────────────────────────────

    private function hrSeenKey(string $hrUserId, string $jobPostingId): string
    {
        return "swipe:hr:seen:{$hrUserId}:{$jobPostingId}";
    }

    public function hasHrSeenApplicant(string $hrUserId, string $jobPostingId, string $applicantId): ?bool
    {
        $key = $this->hrSeenKey($hrUserId, $jobPostingId);
        if (!Redis::exists($key)) {
            return null; // trigger fallback
        }
        return (bool) Redis::sismember($key, $applicantId);
    }

    public function markApplicantSeenByHr(string $hrUserId, string $jobPostingId, string $applicantId): void
    {
        $key = $this->hrSeenKey($hrUserId, $jobPostingId);
        Redis::sadd($key, $applicantId);
        Redis::expire($key, 90 * 86400);
    }

    public function rehydrateHrSeen(string $hrUserId, string $jobPostingId, array $applicantIds): void
    {
        if (empty($applicantIds)) return;
        $key = $this->hrSeenKey($hrUserId, $jobPostingId);
        Redis::sadd($key, ...$applicantIds);
        Redis::expire($key, 90 * 86400);
    }

    // ── Points cache ───────────────────────────────────────────────────────

    public function getPoints(string $userId): ?int
    {
        $val = Redis::get("points:{$userId}");
        return $val !== null ? (int) $val : null;
    }

    public function setPoints(string $userId, int $points): void
    {
        Redis::set("points:{$userId}", $points, 'EX', 600); // 10 minutes
    }
}
```

### `app/Repositories/Postgres/ApplicationRepository.php`

```php
<?php

namespace App\Repositories\Postgres;

use App\Models\Postgres\Application;

class ApplicationRepository
{
    public function create(string $applicantId, string $jobPostingId): Application
    {
        return Application::create([
            'applicant_id'   => $applicantId,
            'job_posting_id' => $jobPostingId,
            'status'         => 'applied',
        ]);
    }

    public function markInvited(string $applicantId, string $jobPostingId, string $message): void
    {
        Application::where('applicant_id', $applicantId)
            ->where('job_posting_id', $jobPostingId)
            ->update([
                'status'             => 'invited',
                'invitation_message' => $message,
                'invited_at'         => now(),
            ]);
    }

    public function exists(string $applicantId, string $jobPostingId): bool
    {
        return Application::where('applicant_id', $applicantId)
            ->where('job_posting_id', $jobPostingId)
            ->exists();
    }

    /**
     * HR applicant queue — 5-tier priority sort.
     * Joins applicant_profiles for subscription_tier + total_points.
     */
    public function getPrioritizedApplicants(string $jobPostingId, int $perPage = 20)
    {
        return Application::with('applicant')
            ->join('applicant_profiles', 'applications.applicant_id', '=', 'applicant_profiles.id')
            ->where('applications.job_posting_id', $jobPostingId)
            ->where('applications.status', 'applied')
            ->orderByRaw("
                CASE
                    WHEN applicant_profiles.subscription_tier = 'pro'
                     AND applicant_profiles.total_points >= 100 THEN 1
                    WHEN applicant_profiles.subscription_tier = 'pro'
                     AND applicant_profiles.total_points < 100  THEN 2
                    WHEN applicant_profiles.subscription_tier != 'pro'
                     AND applicant_profiles.total_points >= 50  THEN 3
                    WHEN applicant_profiles.subscription_tier != 'pro'
                     AND applicant_profiles.total_points BETWEEN 1 AND 49 THEN 4
                    ELSE 5
                END ASC,
                applications.created_at ASC
            ")
            ->select('applications.*')
            ->paginate($perPage);
    }
}
```

---

## 7. Services

Services orchestrate the business logic. They call repositories — not models directly.

### `app/Services/SwipeService.php`

This is the core service. It handles the Redis → MongoDB fallback pattern for every swipe action.

```php
<?php

namespace App\Services;

use App\Jobs\SendInterviewInvitation;
use App\Models\Postgres\ApplicantProfile;
use App\Repositories\Mongo\SwipeHistoryRepository;
use App\Repositories\Postgres\ApplicationRepository;
use App\Repositories\Redis\SwipeCacheRepository;
use Illuminate\Support\Facades\DB;

class SwipeService
{
    public function __construct(
        private SwipeCacheRepository   $cache,
        private SwipeHistoryRepository $swipeHistory,
        private ApplicationRepository  $applications,
    ) {}

    // ── Applicant swipes right on a job ────────────────────────────────────

    public function applicantSwipeRight(string $userId, string $jobId): array
    {
        $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();

        // 1. Enforce daily swipe limit
        if (!$this->hasSwipesRemaining($applicant)) {
            return ['status' => 'limit_reached'];
        }

        // 2. Deduplication — Redis first, MongoDB fallback
        if ($this->hasAlreadySwiped($userId, $jobId, 'job_posting')) {
            return ['status' => 'already_swiped'];
        }

        // 3. Write to MongoDB (source of truth) + PostgreSQL (application record)
        DB::transaction(function () use ($userId, $applicant, $jobId) {
            $this->swipeHistory->record(
                userId:        $userId,
                actorType:     'applicant',
                direction:     'right',
                targetId:      $jobId,
                targetType:    'job_posting',
                jobPostingId:  null,
                meta: [
                    'subscription_tier'       => $applicant->subscription_tier,
                    'daily_swipe_count_at_time' => $this->cache->getCounter($userId) ?? 0,
                ]
            );

            $this->applications->create($applicant->id, $jobId);
        });

        // 4. Update Redis cache
        $this->cache->markJobSeen($userId, $jobId);
        $this->cache->incrementCounter($userId);

        return ['status' => 'applied'];
    }

    // ── Applicant swipes left on a job ─────────────────────────────────────

    public function applicantSwipeLeft(string $userId, string $jobId): array
    {
        $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();

        if ($this->hasAlreadySwiped($userId, $jobId, 'job_posting')) {
            return ['status' => 'already_swiped'];
        }

        // Left swipes only go to MongoDB — no PostgreSQL record needed
        $this->swipeHistory->record(
            userId:       $userId,
            actorType:    'applicant',
            direction:    'left',
            targetId:     $jobId,
            targetType:   'job_posting',
            jobPostingId: null,
            meta: ['subscription_tier' => $applicant->subscription_tier]
        );

        $this->cache->markJobSeen($userId, $jobId);
        $this->cache->incrementCounter($userId);

        return ['status' => 'dismissed'];
    }

    // ── HR swipes right on an applicant (sends invitation) ─────────────────

    public function hrSwipeRight(string $hrUserId, string $jobId, string $applicantId, string $message): array
    {
        if ($this->hasHrAlreadySwiped($hrUserId, $jobId, $applicantId)) {
            return ['status' => 'already_swiped'];
        }

        DB::transaction(function () use ($hrUserId, $jobId, $applicantId, $message) {
            $this->swipeHistory->record(
                userId:       $hrUserId,
                actorType:    'hr',
                direction:    'right',
                targetId:     $applicantId,
                targetType:   'applicant',
                jobPostingId: $jobId,
                meta:         []
            );

            $this->applications->markInvited($applicantId, $jobId, $message);
        });

        $this->cache->markApplicantSeenByHr($hrUserId, $jobId, $applicantId);

        // Dispatch invitation notification + email as a background job
        SendInterviewInvitation::dispatch($applicantId, $jobId, $message)
            ->onQueue('notifications');

        return ['status' => 'invited'];
    }

    // ── HR swipes left on an applicant ─────────────────────────────────────

    public function hrSwipeLeft(string $hrUserId, string $jobId, string $applicantId): array
    {
        if ($this->hasHrAlreadySwiped($hrUserId, $jobId, $applicantId)) {
            return ['status' => 'already_swiped'];
        }

        $this->swipeHistory->record(
            userId:       $hrUserId,
            actorType:    'hr',
            direction:    'left',
            targetId:     $applicantId,
            targetType:   'applicant',
            jobPostingId: $jobId,
            meta:         []
        );

        $this->cache->markApplicantSeenByHr($hrUserId, $jobId, $applicantId);

        return ['status' => 'dismissed'];
    }

    // ── Internal: deduplication with Redis → MongoDB fallback ──────────────

    private function hasAlreadySwiped(string $userId, string $targetId, string $targetType): bool
    {
        // Try Redis first (fast path)
        $cached = $this->cache->hasSeenJob($userId, $targetId);

        if ($cached !== null) {
            return $cached;
        }

        // Redis miss — check MongoDB and re-warm Redis
        $exists  = $this->swipeHistory->hasSwiped($userId, $targetId, $targetType);
        $seenIds = $this->swipeHistory->getSeenJobIds($userId);
        $this->cache->rehydrateDeckSeen($userId, $seenIds);

        return $exists;
    }

    private function hasHrAlreadySwiped(string $hrUserId, string $jobId, string $applicantId): bool
    {
        $cached = $this->cache->hasHrSeenApplicant($hrUserId, $jobId, $applicantId);

        if ($cached !== null) {
            return $cached;
        }

        $exists      = $this->swipeHistory->hasSwiped($hrUserId, $applicantId, 'applicant');
        $seenIds     = $this->swipeHistory->getSeenApplicantIds($hrUserId, $jobId);
        $this->cache->rehydrateHrSeen($hrUserId, $jobId, $seenIds);

        return $exists;
    }

    private function hasSwipesRemaining(ApplicantProfile $applicant): bool
    {
        $userId = $applicant->user_id;

        // Try Redis counter first
        $count = $this->cache->getCounter($userId);

        if ($count === null) {
            // Redis miss — reconstruct from MongoDB
            $count = $this->swipeHistory->countTodaySwipes($userId);
            $this->cache->rehydrateCounter($userId, $count);
        }

        $withinDailyLimit = $count < $applicant->daily_swipe_limit;
        $hasExtraSwipes   = $applicant->extra_swipes_balance > 0;

        return $withinDailyLimit || $hasExtraSwipes;
    }
}
```

### `app/Services/PointService.php`

```php
<?php

namespace App\Services;

use App\Models\Postgres\ApplicantProfile;
use App\Models\Postgres\PointEvent;
use App\Repositories\Redis\SwipeCacheRepository;
use Illuminate\Support\Facades\DB;

class PointService
{
    public function __construct(
        private SwipeCacheRepository $cache
    ) {}

    private const POINT_MAP = [
        'resume_uploaded'         => 30,
        'bio_added'               => 10,
        'profile_photo_uploaded'  => 10,
        'linkedin_linked'         => 20,
        'social_linked'           => 5,
        'skills_added'            => 15,
        'cover_letter_uploaded'   => 15,
        'portfolio_uploaded'      => 20,
        'subscribed_basic'        => 25,
        'subscribed_pro'          => 50,
        'bonus_pro'               => 10,
    ];

    public function award(string $applicantId, string $eventType, ?string $description = null): void
    {
        $points = self::POINT_MAP[$eventType] ?? 0;

        if ($points === 0) return;

        DB::transaction(function () use ($applicantId, $eventType, $points, $description) {
            // The partial unique index in PostgreSQL prevents duplicate one-time events
            PointEvent::create([
                'applicant_id' => $applicantId,
                'event_type'   => $eventType,
                'points'       => $points,
                'description'  => $description,
            ]);

            $profile = ApplicantProfile::where('id', $applicantId)->lockForUpdate()->first();
            $profile->increment('total_points', $points);

            // Update Redis cache immediately
            $this->cache->setPoints($profile->user_id, $profile->total_points);
        });
    }

    public function getPoints(string $userId): int
    {
        $cached = $this->cache->getPoints($userId);

        if ($cached !== null) {
            return $cached;
        }

        $profile = ApplicantProfile::where('user_id', $userId)->firstOrFail();
        $this->cache->setPoints($userId, $profile->total_points);

        return $profile->total_points;
    }
}
```

---

## 8. Controllers

Controllers are thin. They validate input, call the service, return a response.

### `app/Http/Controllers/Applicant/SwipeController.php`

```php
<?php

namespace App\Http\Controllers\Applicant;

use App\Http\Controllers\Controller;
use App\Services\SwipeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SwipeController extends Controller
{
    public function __construct(private SwipeService $swipeService) {}

    public function swipeRight(Request $request, string $jobId): JsonResponse
    {
        $userId = $request->user()->id;
        $result = $this->swipeService->applicantSwipeRight($userId, $jobId);

        return match ($result['status']) {
            'applied'        => $this->success(message: 'Application submitted.'),
            'limit_reached'  => $this->error('SWIPE_LIMIT_REACHED', 'Daily swipe limit reached.', 429),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this job.', 409),
        };
    }

    public function swipeLeft(Request $request, string $jobId): JsonResponse
    {
        $userId = $request->user()->id;
        $result = $this->swipeService->applicantSwipeLeft($userId, $jobId);

        return match ($result['status']) {
            'dismissed'      => $this->success(message: 'Job dismissed.'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this job.', 409),
        };
    }

    private function success(mixed $data = null, string $message = 'OK'): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message]);
    }

    private function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'code' => $code], $status);
    }
}
```

### `app/Http/Controllers/Company/ApplicantReviewController.php`

```php
<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\HrSwipeRequest;
use App\Repositories\Postgres\ApplicationRepository;
use App\Services\SwipeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicantReviewController extends Controller
{
    public function __construct(
        private SwipeService           $swipeService,
        private ApplicationRepository  $applications,
    ) {}

    public function queue(Request $request, string $jobId): JsonResponse
    {
        $applicants = $this->applications->getPrioritizedApplicants($jobId);

        return response()->json(['success' => true, 'data' => $applicants]);
    }

    public function swipeRight(HrSwipeRequest $request, string $jobId, string $applicantId): JsonResponse
    {
        $hrUserId = $request->user()->id;
        $message  = $request->input('message');

        $result = $this->swipeService->hrSwipeRight($hrUserId, $jobId, $applicantId, $message);

        return match ($result['status']) {
            'invited'        => response()->json(['success' => true, 'message' => 'Invitation sent.']),
            'already_swiped' => response()->json(['success' => false, 'code' => 'ALREADY_SWIPED'], 409),
        };
    }

    public function swipeLeft(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $hrUserId = $request->user()->id;
        $result   = $this->swipeService->hrSwipeLeft($hrUserId, $jobId, $applicantId);

        return response()->json(['success' => true, 'message' => 'Applicant dismissed.']);
    }
}
```

---

## 9. Binding It Together (AppServiceProvider)

```php
<?php

namespace App\Providers;

use App\Repositories\Mongo\SwipeHistoryRepository;
use App\Repositories\Postgres\ApplicationRepository;
use App\Repositories\Postgres\ApplicantProfileRepository;
use App\Repositories\Redis\SwipeCacheRepository;
use App\Services\PointService;
use App\Services\SwipeService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Repositories — singleton so they are not re-instantiated per request
        $this->app->singleton(SwipeHistoryRepository::class);
        $this->app->singleton(SwipeCacheRepository::class);
        $this->app->singleton(ApplicationRepository::class);
        $this->app->singleton(ApplicantProfileRepository::class);

        // Services — depend on repositories, auto-resolved by the container
        $this->app->singleton(SwipeService::class);
        $this->app->singleton(PointService::class);
    }
}
```

---

## 10. Jobs & Notifications

### `app/Jobs/SendInterviewInvitation.php`

```php
<?php

namespace App\Jobs;

use App\Models\Postgres\Application;
use App\Models\Postgres\Notification;
use App\Models\Mongo\ApplicantProfileDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendInterviewInvitation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 30; // seconds, Horizon handles exponential backoff

    public function __construct(
        private string $applicantProfileId,
        private string $jobPostingId,
        private string $message,
    ) {}

    public function handle(): void
    {
        $application = Application::with(['applicant.user', 'jobPosting.company'])
            ->where('applicant_id', $this->applicantProfileId)
            ->where('job_posting_id', $this->jobPostingId)
            ->firstOrFail();

        $user    = $application->applicant->user;
        $job     = $application->jobPosting;

        // 1. Store in-app notification
        Notification::create([
            'user_id' => $user->id,
            'type'    => 'interview_invitation',
            'title'   => "Interview invitation from {$job->company->company_name}",
            'body'    => $this->message,
            'data'    => ['job_posting_id' => $this->jobPostingId],
        ]);

        // 2. Send email via Resend (Laravel Mail)
        Mail::to($user->email)->send(
            new \App\Mail\InterviewInvitationMail($application, $this->message)
        );

        // 3. Push notification via Expo (if push token stored)
        // ExpoNotificationService::send($user->id, $title, $body);
    }
}
```

---

## 11. Request Validation

### `app/Http/Requests/Company/HrSwipeRequest.php`

```php
<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class HrSwipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()->role, ['hr', 'company_admin']);
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}
```

---

## 12. Routes

### `routes/api.php`

```php
<?php

use App\Http\Controllers\Applicant\SwipeController;
use App\Http\Controllers\Applicant\ProfileController;
use App\Http\Controllers\Company\ApplicantReviewController;
use App\Http\Controllers\Company\JobPostingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────────────
    Route::post('/auth/register', [\App\Http\Controllers\Auth\AuthController::class, 'register']);
    Route::post('/auth/login',    [\App\Http\Controllers\Auth\AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/auth/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout']);

        // ── Applicant ─────────────────────────────────────────────────────
        Route::prefix('applicant')->middleware('role:applicant')->group(function () {
            Route::get('/profile',    [ProfileController::class, 'show']);
            Route::put('/profile',    [ProfileController::class, 'update']);

            Route::post('/swipe/right/{jobId}', [SwipeController::class, 'swipeRight']);
            Route::post('/swipe/left/{jobId}',  [SwipeController::class, 'swipeLeft']);

            Route::get('/applications', [\App\Http\Controllers\Applicant\ApplicationController::class, 'index']);
        });

        // ── Company / HR ──────────────────────────────────────────────────
        Route::prefix('company')->middleware('role:hr,company_admin')->group(function () {
            Route::apiResource('jobs', JobPostingController::class);
            Route::post('jobs/{jobId}/publish', [JobPostingController::class, 'publish']);

            Route::get('jobs/{jobId}/applicants',
                [ApplicantReviewController::class, 'queue']);
            Route::post('jobs/{jobId}/swipe/right/{applicantId}',
                [ApplicantReviewController::class, 'swipeRight']);
            Route::post('jobs/{jobId}/swipe/left/{applicantId}',
                [ApplicantReviewController::class, 'swipeLeft']);
        });

        // ── Notifications ─────────────────────────────────────────────────
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead']);

    });

});
```

---

## Summary: Request Flow Through the Layers

```
HTTP Request
    │
    ▼
Route  →  FormRequest (validation)
    │
    ▼
Controller  (reads request, calls service, returns JSON)
    │
    ▼
Service  (business logic: SwipeService, PointService)
    │
    ├──▶  SwipeCacheRepository   (Redis — fast path)
    │          │ on miss/failure
    │          └──▶  SwipeHistoryRepository  (MongoDB — fallback + source of truth)
    │
    ├──▶  ApplicationRepository  (PostgreSQL — transactional writes)
    │
    └──▶  Job dispatch  (Redis → Horizon → notification/email)
```

Every layer has one job. Nothing leaks. Redis failures degrade to MongoDB. MongoDB is never skipped for writes.
