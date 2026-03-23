# JobSwipe Backend Implementation Roadmap

> **Current Status:** ~15% Complete  
> **Last Updated:** 2026-03-23  
> **Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Implementation Phases](#implementation-phases)
4. [Detailed Task Breakdown](#detailed-task-breakdown)
5. [Technical Recommendations](#technical-recommendations)
6. [Risk Assessment](#risk-assessment)

---

## Executive Summary

### What's Working ✅

The JobSwipe backend has a solid foundation with:
- **Authentication system** fully operational (email/password + Google OAuth)
- **Database schema** complete with all 15 migrations
- **Core models** implemented for PostgreSQL and MongoDB
- **Multi-database architecture** configured (PostgreSQL, MongoDB, Redis)
- **Infrastructure** ready (Horizon, Meilisearch, R2 storage)

### Critical Gaps ❌

The application is missing **85% of business logic**:
- No swipe functionality (the core feature)
- No job posting management
- No HR applicant review system
- No payment integration
- No notification system
- No admin panel


---

## Current State Analysis

### ✅ Completed Components (15%)

#### 1. Authentication & Authorization
- **Status:** 100% Complete
- **Components:**
  - Email/password registration with OTP verification
  - Google OAuth integration (applicants only)
  - JWT token management via Laravel Sanctum
  - Account linking for existing users
  - Role-based user system (5 roles)
- **Files:**
  - `AuthController.php` - 8 endpoints
  - `OAuthController.php` - Google OAuth flow
  - `AuthService.php` - Business logic
  - `OTPService.php` - OTP generation/verification
  - `TokenService.php` - Token management
  - `ProfileService.php` - Profile creation

#### 2. Database Schema
- **Status:** 100% Complete
- **PostgreSQL Tables:** 15 migrations
  - users, applicant_profiles, company_profiles
  - job_postings, job_skills, applications
  - subscriptions, swipe_packs, point_events
  - company_reviews, company_verifications
  - notifications, personal_access_tokens, sessions
- **MongoDB Collections:** 3 collections
  - applicant_profiles (rich profile data)
  - company_profiles (company details)
  - swipe_history (audit trail)
- **Indexes:** All optimized indexes in place

#### 3. Models & Repositories
- **PostgreSQL Models:** 9 models with relationships
- **MongoDB Models:** 3 models with casts
- **Repositories:** 8 repositories implemented
  - UserRepository, ApplicantProfileRepository
  - CompanyProfileRepository, JobPostingRepository
  - ApplicationRepository, SwipeHistoryRepository
  - ApplicantProfileDocumentRepository, OTPCacheRepository

#### 4. Infrastructure
- **Multi-database setup:** PostgreSQL, MongoDB, Redis
- **Queue system:** Laravel Horizon configured
- **Search:** Meilisearch via Laravel Scout
- **Storage:** Cloudflare R2 configured
- **Email:** Gmail SMTP configured

### ❌ Missing Components (85%)

#### 1. Core Swipe Functionality (0%)
**Impact:** CRITICAL - This is the main feature
- No swipe deck endpoint
- No swipe action handlers (right/left)
- No Redis deduplication logic
- No daily limit enforcement
- No swipe counter tracking
- No deck relevance algorithm

#### 2. Job Management System (0%)
**Impact:** CRITICAL - Required for HR users
- No job posting CRUD endpoints
- No job publishing workflow
- No skill tagging system
- No job expiration handling
- No active listing limit enforcement
- No Meilisearch integration

#### 3. HR Applicant Review (0%)
**Impact:** CRITICAL - Core HR feature
- No applicant queue endpoint
- No priority sorting algorithm
- No HR swipe handlers
- No interview invitation system
- No message template processing

#### 4. Points System (0%)
**Impact:** HIGH - Affects queue priority
- No point calculation service
- No event tracking
- No Redis caching
- No point award triggers

#### 5. Notification System (0%)
**Impact:** HIGH - User engagement
- No push notification service
- No email templates
- No notification dispatch jobs
- No in-app notification endpoints

#### 6. Payment Integration (0%)
**Impact:** HIGH - Revenue generation
- No Stripe integration
- No Apple IAP handling
- No Google Play Billing
- No subscription management
- No swipe pack purchases

#### 7. Profile Management (0%)
**Impact:** MEDIUM - User experience
- No profile CRUD endpoints
- No file upload handling
- No R2 pre-signed URL generation
- No profile completion tracking

#### 8. Admin Panel (0%)
**Impact:** MEDIUM - Operations
- No verification approval endpoints
- No review moderation
- No user management
- No analytics endpoints

#### 9. Middleware & Security (20%)
**Impact:** HIGH - Security & UX
- ✅ Sanctum authentication
- ❌ Role-based access control
- ❌ Swipe limit enforcement
- ❌ Rate limiting
- ❌ Email verification requirement

#### 10. Queue Jobs (0%)
**Impact:** HIGH - Background processing
- No email dispatch jobs
- No notification jobs
- No point recalculation jobs
- No subscription renewal jobs
- No daily swipe reset job

---

## Implementation Phases

### Phase 1: Core Swipe Functionality (Week 1-2)
**Priority:** CRITICAL  
**Estimated Effort:** 40 hours  
**Dependencies:** None

**Goal:** Enable applicants to swipe on jobs and track swipe history

**Deliverables:**
1. SwipeService with Redis deduplication
2. DeckService for job card sorting
3. Swipe endpoints (right/left)
4. Daily limit enforcement
5. Swipe counter tracking

**Success Criteria:**
- Applicants can view job deck
- Applicants can swipe right to apply
- Applicants can swipe left to dismiss
- Daily swipe limits enforced
- No duplicate swipes allowed

---

### Phase 2: Job Management (Week 2-3)
**Priority:** CRITICAL  
**Estimated Effort:** 35 hours  
**Dependencies:** Phase 1

**Goal:** Enable HR to create and manage job postings

**Deliverables:**
1. Job posting CRUD endpoints
2. Skill tagging system
3. Job publishing workflow
4. Active listing limit enforcement
5. Job expiration handling

**Success Criteria:**
- HR can create job postings
- Jobs appear in applicant deck
- Listing limits enforced by tier
- Jobs auto-expire after 60 days

---

### Phase 3: HR Applicant Review (Week 3-4)
**Priority:** CRITICAL  
**Estimated Effort:** 45 hours  
**Dependencies:** Phase 1, Phase 2

**Goal:** Enable HR to review applicants and send invitations

**Deliverables:**
1. Applicant queue with priority algorithm
2. HR swipe endpoints
3. Interview invitation system
4. Message template processing
5. Application status tracking

**Success Criteria:**
- HR sees prioritized applicant queue
- HR can swipe on applicants
- Interview invitations sent via email
- Application status updates correctly

---

### Phase 4: Points System (Week 4-5)
**Priority:** HIGH  
**Estimated Effort:** 25 hours  
**Dependencies:** Phase 3

**Goal:** Implement points calculation and queue prioritization

**Deliverables:**
1. PointService with event tracking
2. Point award triggers
3. Redis caching
4. Queue priority calculation
5. Point event logging

**Success Criteria:**
- Points awarded for profile completion
- Points cached in Redis
- Queue priority reflects points
- Point history visible to users

---

### Phase 5: Notification System (Week 5-6)
**Priority:** HIGH  
**Estimated Effort:** 30 hours  
**Dependencies:** Phase 3

**Goal:** Implement push and email notifications

**Deliverables:**
1. NotificationService
2. Email templates (Resend)
3. Push notification integration (Expo)
4. Notification dispatch jobs
5. In-app notification endpoints

**Success Criteria:**
- Interview invitations sent via email + push
- Swipe limit notifications work
- In-app notifications visible
- Notification preferences respected

---

### Phase 6: Profile Management (Week 6-7)
**Priority:** MEDIUM  
**Estimated Effort:** 30 hours  
**Dependencies:** Phase 1

**Goal:** Enable users to manage their profiles

**Deliverables:**
1. Profile CRUD endpoints
2. File upload with R2 pre-signed URLs
3. Profile completion tracking
4. Resume/cover letter upload
5. Profile photo upload

**Success Criteria:**
- Users can update profiles
- Files upload to R2
- Profile completion tracked
- Points awarded for uploads

---

### Phase 7: Payment Integration (Week 7-9)
**Priority:** HIGH  
**Estimated Effort:** 50 hours  
**Dependencies:** Phase 4

**Goal:** Enable subscriptions and swipe pack purchases

**Deliverables:**
1. Stripe integration (Laravel Cashier)
2. Subscription management
3. Swipe pack purchases
4. Apple IAP validation
5. Google Play Billing validation
6. Webhook handlers

**Success Criteria:**
- Users can subscribe via Stripe
- Swipe packs purchasable
- IAP receipts validated
- Subscription benefits applied

---

### Phase 8: Search & Discovery (Week 9-10)
**Priority:** MEDIUM  
**Estimated Effort:** 25 hours  
**Dependencies:** Phase 2

**Goal:** Implement Meilisearch for job/applicant search

**Deliverables:**
1. Meilisearch indexing
2. Job search endpoint
3. Applicant search endpoint
4. Skill-based filtering
5. Location-based filtering

**Success Criteria:**
- Jobs indexed in Meilisearch
- Search returns relevant results
- Filters work correctly
- Search performance < 100ms

---

### Phase 9: Admin Panel (Week 10-12)
**Priority:** MEDIUM  
**Estimated Effort:** 40 hours  
**Dependencies:** Phase 2, Phase 3

**Goal:** Build admin tools for operations

**Deliverables:**
1. Company verification endpoints
2. Review moderation endpoints
3. User management endpoints
4. Analytics endpoints
5. Role-based access control

**Success Criteria:**
- Admins can approve verifications
- Moderators can flag reviews
- User bans work correctly
- Analytics data accurate

---

### Phase 10: Polish & Optimization (Week 12-13)
**Priority:** LOW  
**Estimated Effort:** 30 hours  
**Dependencies:** All phases

**Goal:** Optimize performance and fix edge cases

**Deliverables:**
1. Redis caching optimization
2. Database query optimization
3. Error handling improvements
4. Rate limiting implementation
5. Security hardening

**Success Criteria:**
- API response time < 200ms
- Redis hit rate > 80%
- No N+1 queries
- Rate limits enforced

---


## Detailed Task Breakdown

### Phase 1: Core Swipe Functionality

#### Task 1.1: SwipeCacheRepository (Redis)
**File:** `app/Repositories/Redis/SwipeCacheRepository.php`  
**Estimated Time:** 4 hours

**Implementation:**
```php
class SwipeCacheRepository
{
    // Counter: swipe:counter:{user_id}:{YYYY-MM-DD}
    public function getCounter(string $userId): ?int
    public function incrementCounter(string $userId): int
    public function rehydrateCounter(string $userId, int $count): void
    
    // Deck dedup: swipe:deck:seen:{user_id}
    public function hasSeenJob(string $userId, string $jobId): ?bool
    public function markJobSeen(string $userId, string $jobId): void
    public function rehydrateDeckSeen(string $userId, array $jobIds): void
    
    // HR dedup: swipe:hr:seen:{hr_id}:{job_id}
    public function hasHrSeenApplicant(string $hrUserId, string $jobPostingId, string $applicantId): ?bool
    public function markApplicantSeenByHr(string $hrUserId, string $jobPostingId, string $applicantId): void
    public function rehydrateHrSeen(string $hrUserId, string $jobPostingId, array $applicantIds): void
    
    // Points cache: points:{user_id}
    public function getPoints(string $userId): ?int
    public function setPoints(string $userId, int $points): void
}
```

**Tests:**
- Counter increments correctly
- TTL expires at midnight PHT
- Deduplication prevents double swipes
- Fallback to MongoDB works

---

#### Task 1.2: SwipeService
**File:** `app/Services/SwipeService.php`  
**Estimated Time:** 8 hours

**Implementation:**
```php
class SwipeService
{
    public function __construct(
        private SwipeCacheRepository $cache,
        private SwipeHistoryRepository $swipeHistory,
        private ApplicationRepository $applications,
    ) {}
    
    // Applicant swipes
    public function applicantSwipeRight(string $userId, string $jobId): array
    public function applicantSwipeLeft(string $userId, string $jobId): array
    
    // HR swipes
    public function hrSwipeRight(string $hrUserId, string $jobId, string $applicantId, string $message): array
    public function hrSwipeLeft(string $hrUserId, string $jobId, string $applicantId): array
    
    // Helpers
    private function hasSwipesRemaining(ApplicantProfile $applicant): bool
    private function hasAlreadySwiped(string $userId, string $targetId, string $targetType): bool
    private function hasHrAlreadySwiped(string $hrUserId, string $jobId, string $applicantId): bool
}
```

**Business Logic:**
1. Check daily swipe limit (Redis counter)
2. Check deduplication (Redis Set, fallback to MongoDB)
3. Write to MongoDB (source of truth)
4. Write to PostgreSQL (application record)
5. Update Redis cache
6. Dispatch notification job (for HR swipes)

**Tests:**
- Swipe limit enforced
- Deduplication works
- MongoDB + PostgreSQL consistency
- Redis fallback works

---

#### Task 1.3: DeckService
**File:** `app/Services/DeckService.php`  
**Estimated Time:** 6 hours

**Implementation:**
```php
class DeckService
{
    public function __construct(
        private JobPostingRepository $jobs,
        private SwipeCacheRepository $cache,
        private SwipeHistoryRepository $swipeHistory,
        private ApplicantProfileDocumentRepository $profiles,
    ) {}
    
    public function getJobDeck(string $userId, int $perPage = 20): array
    {
        // 1. Get seen job IDs from Redis (fallback to MongoDB)
        // 2. Query active jobs excluding seen
        // 3. Calculate relevance score (skill match)
        // 4. Sort by relevance + recency
        // 5. Paginate
    }
    
    private function calculateRelevanceScore(JobPosting $job, array $userSkills): float
    {
        // Skill overlap scoring
        // 0.0 = no match, 1.0 = perfect match
    }
}
```

**Relevance Algorithm:**
```
Score = (matched_skills / total_job_skills) * 0.7 + recency_factor * 0.3

Recency Factor:
- Published < 7 days ago: 1.0
- Published 7-14 days ago: 0.8
- Published 14-30 days ago: 0.6
- Published > 30 days ago: 0.4
```

**Tests:**
- Seen jobs excluded
- Relevance scoring correct
- Pagination works
- Fallback to MongoDB works

---

#### Task 1.4: SwipeController (Applicant)
**File:** `app/Http/Controllers/Applicant/SwipeController.php`  
**Estimated Time:** 4 hours

**Endpoints:**
```php
GET    /api/v1/applicant/swipe/deck
POST   /api/v1/applicant/swipe/right/{job_id}
POST   /api/v1/applicant/swipe/left/{job_id}
GET    /api/v1/applicant/swipe/limits
```

**Implementation:**
```php
class SwipeController extends Controller
{
    public function __construct(
        private SwipeService $swipe,
        private DeckService $deck,
    ) {}
    
    public function getDeck(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $deck = $this->deck->getJobDeck($userId, perPage: 20);
        
        return $this->success(data: $deck);
    }
    
    public function swipeRight(Request $request, string $jobId): JsonResponse
    {
        $result = $this->swipe->applicantSwipeRight($request->user()->id, $jobId);
        
        return match ($result['status']) {
            'applied' => $this->success(message: 'Application submitted'),
            'limit_reached' => $this->error('SWIPE_LIMIT_REACHED', 'Daily swipe limit reached', 429),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this job', 409),
        };
    }
    
    public function swipeLeft(Request $request, string $jobId): JsonResponse
    {
        $result = $this->swipe->applicantSwipeLeft($request->user()->id, $jobId);
        
        return match ($result['status']) {
            'dismissed' => $this->success(message: 'Job dismissed'),
            'limit_reached' => $this->error('SWIPE_LIMIT_REACHED', 'Daily swipe limit reached', 429),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this job', 409),
        };
    }
    
    public function getLimits(Request $request): JsonResponse
    {
        $applicant = $request->user()->applicantProfile;
        
        return $this->success(data: [
            'daily_swipes_used' => $applicant->daily_swipes_used,
            'daily_swipe_limit' => $applicant->daily_swipe_limit,
            'extra_swipes_balance' => $applicant->extra_swipes_balance,
            'has_swipes_remaining' => $applicant->hasSwipesRemaining(),
        ]);
    }
}
```

**Tests:**
- Deck returns jobs
- Swipe right creates application
- Swipe left records dismissal
- Limits endpoint accurate

---

#### Task 1.5: CheckSwipeLimit Middleware
**File:** `app/Http/Middleware/CheckSwipeLimit.php`  
**Estimated Time:** 2 hours

**Implementation:**
```php
class CheckSwipeLimit
{
    public function handle(Request $request, Closure $next)
    {
        $applicant = $request->user()->applicantProfile;
        
        if (!$applicant->hasSwipesRemaining()) {
            return response()->json([
                'success' => false,
                'message' => 'Daily swipe limit reached. Upgrade or purchase swipe packs.',
                'code' => 'SWIPE_LIMIT_REACHED',
            ], 429);
        }
        
        return $next($request);
    }
}
```

**Apply to routes:**
```php
Route::middleware(['auth:sanctum', CheckSwipeLimit::class])->group(function () {
    Route::post('applicant/swipe/right/{job_id}', [SwipeController::class, 'swipeRight']);
    Route::post('applicant/swipe/left/{job_id}', [SwipeController::class, 'swipeLeft']);
});
```

---

#### Task 1.6: ResetDailySwipesJob
**File:** `app/Jobs/ResetDailySwipesJob.php`  
**Estimated Time:** 3 hours

**Implementation:**
```php
class ResetDailySwipesJob implements ShouldQueue
{
    public function handle(): void
    {
        // Reset all applicant daily_swipes_used to 0
        ApplicantProfile::query()->update([
            'daily_swipes_used' => 0,
            'swipe_reset_at' => now()->toDateString(),
        ]);
        
        // Clear Redis counters (they auto-expire, but clean up anyway)
        $pattern = 'swipe:counter:*';
        $keys = Redis::keys($pattern);
        if (!empty($keys)) {
            Redis::del(...$keys);
        }
    }
}
```

**Schedule in `app/Console/Kernel.php`:**
```php
protected function schedule(Schedule $schedule): void
{
    $schedule->job(new ResetDailySwipesJob)
        ->dailyAt('00:00')
        ->timezone('Asia/Manila');
}
```

---

#### Task 1.7: Register Services in AppServiceProvider
**File:** `app/Providers/AppServiceProvider.php`  
**Estimated Time:** 1 hour

**Add to register():**
```php
$this->app->singleton(\App\Repositories\Redis\SwipeCacheRepository::class);
$this->app->singleton(\App\Services\SwipeService::class);
$this->app->singleton(\App\Services\DeckService::class);
```

---

#### Task 1.8: API Routes
**File:** `routes/api.php`  
**Estimated Time:** 1 hour

**Add routes:**
```php
Route::prefix('v1')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        
        // Applicant Swipe
        Route::prefix('applicant/swipe')->group(function () {
            Route::get('deck', [SwipeController::class, 'getDeck']);
            Route::get('limits', [SwipeController::class, 'getLimits']);
            
            Route::middleware(CheckSwipeLimit::class)->group(function () {
                Route::post('right/{job_id}', [SwipeController::class, 'swipeRight']);
                Route::post('left/{job_id}', [SwipeController::class, 'swipeLeft']);
            });
        });
    });
});
```

---

#### Task 1.9: Integration Tests
**File:** `tests/Feature/SwipeTest.php`  
**Estimated Time:** 4 hours

**Test Cases:**
1. Applicant can view job deck
2. Applicant can swipe right (creates application)
3. Applicant can swipe left (records dismissal)
4. Swipe limit enforced
5. Duplicate swipes prevented
6. Redis fallback works
7. Daily reset works

---

#### Task 1.10: Documentation
**File:** `docs/api/swipe.md`  
**Estimated Time:** 2 hours

**Document:**
- Endpoint specifications
- Request/response examples
- Error codes
- Rate limits
- Business logic flow

---

### Phase 2: Job Management

#### Task 2.1: JobPostingController
**File:** `app/Http/Controllers/Company/JobPostingController.php`  
**Estimated Time:** 6 hours

**Endpoints:**
```php
GET    /api/v1/company/jobs
POST   /api/v1/company/jobs
GET    /api/v1/company/jobs/{id}
PUT    /api/v1/company/jobs/{id}
DELETE /api/v1/company/jobs/{id}
POST   /api/v1/company/jobs/{id}/publish
POST   /api/v1/company/jobs/{id}/close
```

**Implementation:**
```php
class JobPostingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->companyProfile->id;
        $jobs = JobPosting::where('company_id', $companyId)
            ->with('skills')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
            
        return $this->success(data: $jobs);
    }
    
    public function store(CreateJobPostingRequest $request): JsonResponse
    {
        $company = $request->user()->companyProfile;
        
        // Check active listing limit
        if ($company->subscription_tier === 'basic' && $company->active_listings_count >= 5) {
            return $this->error('LISTING_LIMIT_REACHED', 'Active listing limit reached', 403);
        }
        
        DB::transaction(function () use ($request, $company, &$job) {
            $job = JobPosting::create([
                'company_id' => $company->id,
                'title' => $request->title,
                'description' => $request->description,
                'salary_min' => $request->salary_min,
                'salary_max' => $request->salary_max,
                'salary_is_hidden' => $request->salary_is_hidden ?? false,
                'work_type' => $request->work_type,
                'location' => $request->location,
                'location_city' => $request->location_city,
                'location_region' => $request->location_region,
                'interview_template' => $request->interview_template,
                'status' => 'draft',
            ]);
            
            // Add skills
            foreach ($request->skills as $skill) {
                JobSkill::create([
                    'job_posting_id' => $job->id,
                    'skill_name' => $skill['name'],
                    'skill_type' => $skill['type'],
                ]);
            }
        });
        
        return $this->success(data: $job, message: 'Job posting created', status: 201);
    }
    
    public function publish(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);
        
        // Authorization check
        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }
        
        $job->update([
            'status' => 'active',
            'published_at' => now(),
            'expires_at' => now()->addDays(60),
        ]);
        
        // Increment active listings count
        $job->company->increment('active_listings_count');
        
        // Index in Meilisearch
        $job->searchable();
        
        return $this->success(message: 'Job published successfully');
    }
}
```

---

#### Task 2.2: CreateJobPostingRequest
**File:** `app/Http/Requests/Company/CreateJobPostingRequest.php`  
**Estimated Time:** 2 hours

**Validation Rules:**
```php
public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string', 'min:100'],
        'work_type' => ['required', 'in:remote,hybrid,on_site'],
        'location' => ['required_if:work_type,hybrid,on_site', 'string', 'max:255'],
        'location_city' => ['nullable', 'string', 'max:100'],
        'location_region' => ['nullable', 'string', 'max:100'],
        'salary_min' => ['nullable', 'numeric', 'min:0'],
        'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
        'salary_is_hidden' => ['boolean'],
        'interview_template' => ['required', 'string', 'max:1000'],
        'skills' => ['required', 'array', 'min:1'],
        'skills.*.name' => ['required', 'string', 'max:100'],
        'skills.*.type' => ['required', 'in:hard,soft'],
    ];
}
```

---

#### Task 2.3: JobSkill Model
**File:** `app/Models/PostgreSQL/JobSkill.php`  
**Estimated Time:** 1 hour

**Implementation:**
```php
class JobSkill extends Model
{
    protected $connection = 'pgsql';
    protected $table = 'job_skills';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'job_posting_id', 'skill_name', 'skill_type',
    ];
    
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
```

---

#### Task 2.4: ExpireJobPostingsJob
**File:** `app/Jobs/ExpireJobPostingsJob.php`  
**Estimated Time:** 2 hours

**Implementation:**
```php
class ExpireJobPostingsJob implements ShouldQueue
{
    public function handle(): void
    {
        $expiredJobs = JobPosting::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->get();
            
        foreach ($expiredJobs as $job) {
            $job->update(['status' => 'expired']);
            $job->company->decrement('active_listings_count');
            
            // Remove from Meilisearch
            $job->unsearchable();
        }
    }
}
```

**Schedule:**
```php
$schedule->job(new ExpireJobPostingsJob)
    ->hourly();
```

---


### Phase 3: HR Applicant Review

#### Task 3.1: ApplicantReviewController
**File:** `app/Http/Controllers/Company/ApplicantReviewController.php`  
**Estimated Time:** 8 hours

**Endpoints:**
```php
GET    /api/v1/company/jobs/{job_id}/applicants
GET    /api/v1/company/jobs/{job_id}/applicants/{applicant_id}
POST   /api/v1/company/jobs/{job_id}/swipe/right/{applicant_id}
POST   /api/v1/company/jobs/{job_id}/swipe/left/{applicant_id}
```

**Implementation:**
```php
class ApplicantReviewController extends Controller
{
    public function __construct(
        private ApplicationRepository $applications,
        private SwipeService $swipe,
    ) {}
    
    public function getApplicants(Request $request, string $jobId): JsonResponse
    {
        // Authorization: verify job belongs to user's company
        $job = JobPosting::findOrFail($jobId);
        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }
        
        // Get prioritized applicants (5-tier algorithm)
        $applicants = $this->applications->getPrioritizedApplicants($jobId, perPage: 20);
        
        // Load MongoDB profile data
        foreach ($applicants as $application) {
            $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();
            $application->applicant->profile_data = $mongoProfile;
        }
        
        return $this->success(data: $applicants);
    }
    
    public function getApplicantDetail(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);
        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }
        
        $application = Application::where('job_posting_id', $jobId)
            ->where('applicant_id', $applicantId)
            ->with('applicant')
            ->firstOrFail();
            
        // Load full MongoDB profile
        $mongoProfile = ApplicantProfileDocument::where('user_id', $application->applicant->user_id)->first();
        $application->applicant->profile_data = $mongoProfile;
        
        return $this->success(data: $application);
    }
    
    public function swipeRight(SwipeRightRequest $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);
        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }
        
        // Process interview template message
        $message = $this->processMessageTemplate(
            $request->message ?? $job->interview_template,
            $applicantId,
            $jobId
        );
        
        $result = $this->swipe->hrSwipeRight(
            $request->user()->id,
            $jobId,
            $applicantId,
            $message
        );
        
        return match ($result['status']) {
            'invited' => $this->success(message: 'Interview invitation sent'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this applicant', 409),
        };
    }
    
    public function swipeLeft(Request $request, string $jobId, string $applicantId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);
        if ($job->company_id !== $request->user()->companyProfile->id) {
            return $this->error('UNAUTHORIZED', 'Not authorized', 403);
        }
        
        $result = $this->swipe->hrSwipeLeft(
            $request->user()->id,
            $jobId,
            $applicantId
        );
        
        return match ($result['status']) {
            'dismissed' => $this->success(message: 'Applicant dismissed'),
            'already_swiped' => $this->error('ALREADY_SWIPED', 'Already swiped on this applicant', 409),
        };
    }
    
    private function processMessageTemplate(string $template, string $applicantId, string $jobId): string
    {
        $applicant = ApplicantProfile::findOrFail($applicantId);
        $mongoProfile = ApplicantProfileDocument::where('user_id', $applicant->user_id)->first();
        $job = JobPosting::findOrFail($jobId);
        
        $replacements = [
            '{{applicant_name}}' => $mongoProfile->first_name . ' ' . $mongoProfile->last_name,
            '{{job_title}}' => $job->title,
            '{{company_name}}' => $job->company->company_name,
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
```

---

#### Task 3.2: SendInterviewInvitationJob
**File:** `app/Jobs/SendInterviewInvitationJob.php`  
**Estimated Time:** 4 hours

**Implementation:**
```php
class SendInterviewInvitationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public function __construct(
        private string $applicantId,
        private string $jobId,
        private string $message,
    ) {}
    
    public function handle(): void
    {
        $applicant = ApplicantProfile::findOrFail($this->applicantId);
        $job = JobPosting::with('company')->findOrFail($this->jobId);
        $user = $applicant->user;
        $mongoProfile = ApplicantProfileDocument::where('user_id', $user->id)->first();
        
        // Create in-app notification
        Notification::create([
            'user_id' => $user->id,
            'type' => 'interview_invitation',
            'title' => "Interview Invitation from {$job->company->company_name}",
            'body' => "You've been invited to interview for {$job->title}",
            'data' => [
                'job_id' => $this->jobId,
                'company_id' => $job->company_id,
                'message' => $this->message,
            ],
        ]);
        
        // Send email via Resend
        Mail::to($user->email)->send(new InterviewInvitationMail(
            applicantName: $mongoProfile->first_name,
            jobTitle: $job->title,
            companyName: $job->company->company_name,
            message: $this->message,
            jobUrl: config('app.frontend_url') . '/jobs/' . $this->jobId,
        ));
        
        // Send push notification (if mobile token exists)
        // TODO: Implement Expo push notification
    }
}
```

---

#### Task 3.3: InterviewInvitationMail
**File:** `app/Mail/InterviewInvitationMail.php`  
**Estimated Time:** 3 hours

**Implementation:**
```php
class InterviewInvitationMail extends Mailable
{
    use Queueable, SerializesModels;
    
    public function __construct(
        public string $applicantName,
        public string $jobTitle,
        public string $companyName,
        public string $message,
        public string $jobUrl,
    ) {}
    
    public function build(): self
    {
        return $this->subject("Interview Invitation from {$this->companyName}")
            ->view('emails.interview-invitation')
            ->with([
                'applicantName' => $this->applicantName,
                'jobTitle' => $this->jobTitle,
                'companyName' => $this->companyName,
                'message' => $this->message,
                'jobUrl' => $this->jobUrl,
            ]);
    }
}
```

**Email Template:**
```blade
<!-- resources/views/emails/interview-invitation.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Interview Invitation</title>
</head>
<body>
    <h1>Congratulations, {{ $applicantName }}!</h1>
    
    <p>You've been invited to interview at <strong>{{ $companyName }}</strong> for the position of <strong>{{ $jobTitle }}</strong>.</p>
    
    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p><strong>Message from the hiring team:</strong></p>
        <p>{{ $message }}</p>
    </div>
    
    <p>
        <a href="{{ $jobUrl }}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Job Details
        </a>
    </p>
    
    <p>Good luck!</p>
    <p>— The JobSwipe Team</p>
</body>
</html>
```

---

### Phase 4: Points System

#### Task 4.1: PointService
**File:** `app/Services/PointService.php`  
**Estimated Time:** 6 hours

**Implementation:**
```php
class PointService
{
    public function __construct(
        private PointEventRepository $pointEvents,
        private SwipeCacheRepository $cache,
    ) {}
    
    public function awardPoints(string $applicantId, string $eventType, ?string $description = null): int
    {
        $pointsMap = [
            'resume_uploaded' => 30,
            'bio_added' => 10,
            'profile_photo_uploaded' => 10,
            'linkedin_linked' => 20,
            'social_linked' => 5,
            'skills_added' => 15,
            'cover_letter_uploaded' => 15,
            'portfolio_uploaded' => 20,
            'subscribed_basic' => 25,
            'subscribed_pro' => 50,
            'bonus_pro' => 10,
        ];
        
        $points = $pointsMap[$eventType] ?? 0;
        
        try {
            // Create point event (will fail if duplicate one-time event due to unique index)
            PointEvent::create([
                'applicant_id' => $applicantId,
                'event_type' => $eventType,
                'points' => $points,
                'description' => $description,
            ]);
            
            // Recalculate total points
            $totalPoints = $this->recalculatePoints($applicantId);
            
            return $totalPoints;
        } catch (\Exception $e) {
            // Duplicate event, return current points
            return $this->getPoints($applicantId);
        }
    }
    
    public function recalculatePoints(string $applicantId): int
    {
        $totalPoints = PointEvent::where('applicant_id', $applicantId)->sum('points');
        
        // Update PostgreSQL
        ApplicantProfile::where('id', $applicantId)->update(['total_points' => $totalPoints]);
        
        // Update Redis cache
        $this->cache->setPoints($applicantId, $totalPoints);
        
        return $totalPoints;
    }
    
    public function getPoints(string $applicantId): int
    {
        // Try Redis first
        $cached = $this->cache->getPoints($applicantId);
        if ($cached !== null) {
            return $cached;
        }
        
        // Fallback to PostgreSQL
        $applicant = ApplicantProfile::findOrFail($applicantId);
        $this->cache->setPoints($applicantId, $applicant->total_points);
        
        return $applicant->total_points;
    }
    
    public function getPointHistory(string $applicantId): array
    {
        return PointEvent::where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
}
```

---

#### Task 4.2: PointEventRepository
**File:** `app/Repositories/PostgreSQL/PointEventRepository.php`  
**Estimated Time:** 2 hours

**Implementation:**
```php
class PointEventRepository
{
    public function create(array $data): PointEvent
    {
        return PointEvent::create($data);
    }
    
    public function getHistory(string $applicantId): Collection
    {
        return PointEvent::where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
    
    public function getTotalPoints(string $applicantId): int
    {
        return PointEvent::where('applicant_id', $applicantId)->sum('points');
    }
    
    public function hasEvent(string $applicantId, string $eventType): bool
    {
        return PointEvent::where('applicant_id', $applicantId)
            ->where('event_type', $eventType)
            ->exists();
    }
}
```

---

#### Task 4.3: PointEvent Model
**File:** `app/Models/PostgreSQL/PointEvent.php`  
**Estimated Time:** 1 hour

**Implementation:**
```php
class PointEvent extends Model
{
    protected $connection = 'pgsql';
    protected $table = 'point_events';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    
    protected $fillable = [
        'applicant_id', 'event_type', 'points', 'description',
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
    ];
    
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(ApplicantProfile::class, 'applicant_id');
    }
}
```

---

#### Task 4.4: Integrate Points into Profile Updates
**File:** `app/Services/ProfileService.php`  
**Estimated Time:** 3 hours

**Update existing methods to award points:**
```php
public function updateApplicantProfile(string $userId, array $data): void
{
    $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();
    $mongoProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
    
    // Track what changed
    $changes = [];
    
    if (isset($data['bio']) && empty($mongoProfile->bio)) {
        $changes[] = 'bio_added';
    }
    
    if (isset($data['linkedin_url']) && empty($mongoProfile->linkedin_url)) {
        $changes[] = 'linkedin_linked';
    }
    
    if (isset($data['skills']) && count($data['skills']) >= 3 && count($mongoProfile->skills ?? []) < 3) {
        $changes[] = 'skills_added';
    }
    
    // Update MongoDB
    $mongoProfile->update($data);
    
    // Award points for new completions
    foreach ($changes as $eventType) {
        $this->points->awardPoints($applicant->id, $eventType);
    }
}
```

---

### Phase 5: Notification System

#### Task 5.1: NotificationService
**File:** `app/Services/NotificationService.php`  
**Estimated Time:** 6 hours

**Implementation:**
```php
class NotificationService
{
    public function __construct(
        private NotificationRepository $notifications,
    ) {}
    
    public function create(string $userId, string $type, string $title, string $body, ?array $data = null): Notification
    {
        return $this->notifications->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);
    }
    
    public function sendPush(string $userId, string $title, string $body, ?array $data = null): void
    {
        // Get user's push token from database (to be implemented)
        // Send via Expo Push Service
        // TODO: Implement Expo push notification
    }
    
    public function sendEmail(string $userId, Mailable $mailable): void
    {
        $user = User::findOrFail($userId);
        Mail::to($user->email)->queue($mailable);
    }
    
    public function markAsRead(string $notificationId): void
    {
        $this->notifications->markAsRead($notificationId);
    }
    
    public function markAllAsRead(string $userId): void
    {
        $this->notifications->markAllAsRead($userId);
    }
    
    public function getUnreadCount(string $userId): int
    {
        return $this->notifications->getUnreadCount($userId);
    }
}
```

---

#### Task 5.2: NotificationRepository
**File:** `app/Repositories/PostgreSQL/NotificationRepository.php`  
**Estimated Time:** 2 hours

**Implementation:**
```php
class NotificationRepository
{
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }
    
    public function getForUser(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    
    public function getUnread(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
    
    public function getUnreadCount(string $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }
    
    public function markAsRead(string $notificationId): void
    {
        Notification::where('id', $notificationId)->update(['read_at' => now()]);
    }
    
    public function markAllAsRead(string $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
```

---

#### Task 5.3: NotificationController
**File:** `app/Http/Controllers/NotificationController.php`  
**Estimated Time:** 3 hours

**Endpoints:**
```php
GET    /api/v1/notifications
GET    /api/v1/notifications/unread
PATCH  /api/v1/notifications/{id}/read
PATCH  /api/v1/notifications/read-all
```

**Implementation:**
```php
class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notifications,
    ) {}
    
    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notifications->getForUser($request->user()->id);
        return $this->success(data: $notifications);
    }
    
    public function unread(Request $request): JsonResponse
    {
        $notifications = $this->notifications->getUnread($request->user()->id);
        $count = $this->notifications->getUnreadCount($request->user()->id);
        
        return $this->success(data: [
            'notifications' => $notifications,
            'unread_count' => $count,
        ]);
    }
    
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->notifications->markAsRead($id);
        return $this->success(message: 'Notification marked as read');
    }
    
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notifications->markAllAsRead($request->user()->id);
        return $this->success(message: 'All notifications marked as read');
    }
}
```

---


## Technical Recommendations

### 1. Code Organization

**Follow Laravel Best Practices:**
- Controllers: HTTP handling only, no business logic
- Services: Business logic orchestration
- Repositories: Data access abstraction
- Models: Data representation and relationships
- Jobs: Background processing
- Middleware: Request filtering and validation

**Naming Conventions:**
```
Controllers:  {Resource}Controller.php
Services:     {Domain}Service.php
Repositories: {Model}Repository.php
Jobs:         {Action}{Resource}Job.php
Requests:     {Action}{Resource}Request.php
```

---

### 2. Testing Strategy

**Unit Tests (70% coverage target):**
- Services: Business logic validation
- Repositories: Data access patterns
- Models: Relationships and scopes

**Integration Tests (20% coverage target):**
- API endpoints: Request/response validation
- Queue jobs: Job execution
- Database: Multi-store consistency

**Feature Tests (10% coverage target):**
- End-to-end user flows
- Critical business scenarios

**Test Structure:**
```
tests/
├── Unit/
│   ├── Services/
│   ├── Repositories/
│   └── Models/
├── Feature/
│   ├── Auth/
│   ├── Swipe/
│   ├── Jobs/
│   └── Notifications/
└── Integration/
    ├── Database/
    └── Queue/
```

---

### 3. Performance Optimization

**Redis Caching Strategy:**
```
Priority 1 (Hot): Swipe counters, deduplication sets
Priority 2 (Warm): Points cache, session cache
Priority 3 (Cold): Search results, analytics
```

**Database Query Optimization:**
- Use eager loading to prevent N+1 queries
- Index all foreign keys and frequently queried columns
- Use database transactions for multi-step operations
- Implement query result caching for expensive queries

**API Response Optimization:**
- Paginate all list endpoints (default: 20 items)
- Use resource transformers for consistent responses
- Implement ETags for cacheable resources
- Compress responses with gzip

---

### 4. Error Handling

**Standardized Error Responses:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

**Error Codes:**
```
VALIDATION_ERROR        - 422
UNAUTHENTICATED        - 401
UNAUTHORIZED           - 403
NOT_FOUND              - 404
SWIPE_LIMIT_REACHED    - 429
LISTING_LIMIT_REACHED  - 403
ALREADY_SWIPED         - 409
VERIFICATION_REQUIRED  - 403
SUBSCRIPTION_REQUIRED  - 403
```

**Exception Handling:**
- Use Laravel's exception handler
- Log all errors to Sentry
- Return user-friendly messages
- Never expose stack traces in production

---

### 5. Security Best Practices

**Authentication:**
- Use Laravel Sanctum for API authentication
- Implement token rotation on sensitive actions
- Set token expiry to 30 days
- Revoke tokens on logout and password change

**Authorization:**
- Implement role-based middleware
- Check resource ownership in controllers
- Use Laravel policies for complex authorization
- Validate all user inputs

**Data Protection:**
- Hash passwords with bcrypt (cost: 12)
- Encrypt sensitive data at rest
- Use HTTPS for all API traffic
- Implement CORS properly

**Rate Limiting:**
```
Unauthenticated: 20 req/min per IP
Authenticated:   60 req/min per user
Swipe actions:   Daily limit based on tier
```

---

### 6. Monitoring & Logging

**Application Monitoring:**
- Sentry for error tracking
- Laravel Telescope for local debugging
- Laravel Horizon for queue monitoring
- Custom metrics for business KPIs

**Logging Strategy:**
```
Emergency: System unusable
Alert:     Immediate action required
Critical:  Critical conditions
Error:     Error conditions
Warning:   Warning conditions
Notice:    Normal but significant
Info:      Informational messages
Debug:     Debug-level messages
```

**Key Metrics to Track:**
- API response times
- Queue job processing times
- Redis hit/miss rates
- Database query times
- Swipe conversion rates
- Subscription conversion rates

---

### 7. Database Management

**Migration Best Practices:**
- Never modify existing migrations
- Use descriptive migration names
- Add indexes in separate migrations
- Test rollback functionality
- Document complex migrations

**Seeding Strategy:**
```
DatabaseSeeder
├── UserSeeder (test users)
├── CompanySeeder (sample companies)
├── JobPostingSeeder (sample jobs)
└── ApplicationSeeder (sample applications)
```

**Backup Strategy:**
- PostgreSQL: Daily full backup + hourly incremental
- MongoDB: Daily full backup
- Redis: No backup (ephemeral data)
- Retention: 30 days

---

### 8. API Versioning

**Current Version:** v1  
**Versioning Strategy:** URL-based (`/api/v1/...`)

**Breaking Changes:**
- Increment version number
- Maintain old version for 6 months
- Document migration path
- Notify users 30 days in advance

**Non-Breaking Changes:**
- Add new endpoints
- Add optional parameters
- Add new response fields
- Deprecate with warnings

---

### 9. Documentation

**Required Documentation:**
1. API documentation (OpenAPI/Swagger)
2. Database schema documentation
3. Architecture decision records (ADRs)
4. Deployment runbook
5. Troubleshooting guide

**Code Documentation:**
- PHPDoc for all public methods
- Inline comments for complex logic
- README for each major module
- CHANGELOG for version history

---

### 10. Development Workflow

**Git Branching Strategy:**
```
main        → Production
staging     → Staging environment
develop     → Development integration
feature/*   → Feature branches
bugfix/*    → Bug fix branches
hotfix/*    → Production hotfixes
```

**Commit Message Format:**
```
type(scope): subject

body

footer
```

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

**Pull Request Process:**
1. Create feature branch from `develop`
2. Implement feature with tests
3. Run code quality checks (Pint, PHPStan)
4. Create PR with description
5. Code review by 1+ developers
6. Merge to `develop` after approval
7. Deploy to staging for QA
8. Merge to `main` for production

---

## Risk Assessment

### High-Risk Areas

#### 1. Swipe Deduplication
**Risk:** Duplicate swipes due to race conditions  
**Mitigation:**
- Use Redis atomic operations (SADD)
- MongoDB unique index as fallback
- Transaction wrapping for multi-store writes
- Comprehensive integration tests

#### 2. Daily Swipe Reset
**Risk:** Reset job fails, users stuck at limit  
**Mitigation:**
- Scheduled job with retry logic
- Manual reset endpoint for admins
- Monitoring alerts on job failure
- Fallback to Redis TTL expiry

#### 3. Payment Integration
**Risk:** Payment processed but benefits not applied  
**Mitigation:**
- Idempotent webhook handlers
- Database transactions for payment + benefit
- Webhook signature verification
- Manual reconciliation tools

#### 4. Queue Job Failures
**Risk:** Critical jobs fail silently  
**Mitigation:**
- Laravel Horizon monitoring
- Failed job alerts to Sentry
- Automatic retry with exponential backoff
- Manual job replay tools

#### 5. Multi-Database Consistency
**Risk:** PostgreSQL and MongoDB out of sync  
**Mitigation:**
- Use PostgreSQL as source of truth for critical data
- MongoDB for supplementary data only
- Eventual consistency acceptable for profiles
- Reconciliation jobs for critical data

---

### Medium-Risk Areas

#### 6. Search Performance
**Risk:** Meilisearch slow or unavailable  
**Mitigation:**
- Fallback to PostgreSQL full-text search
- Cache search results in Redis
- Implement search result pagination
- Monitor Meilisearch health

#### 7. File Upload Abuse
**Risk:** Users upload malicious files  
**Mitigation:**
- Validate file types server-side
- Scan files with antivirus (ClamAV)
- Implement upload rate limiting
- Set strict file size limits

#### 8. API Rate Limiting
**Risk:** Abuse or DDoS attacks  
**Mitigation:**
- Redis-based rate limiting
- Cloudflare WAF protection
- IP-based throttling
- User-based throttling

---

### Low-Risk Areas

#### 9. Email Delivery
**Risk:** Emails not delivered  
**Mitigation:**
- Use reliable provider (Resend)
- Queue email jobs
- Retry failed emails
- Monitor delivery rates

#### 10. Session Management
**Risk:** Session hijacking  
**Mitigation:**
- Use secure, httpOnly cookies
- Implement CSRF protection
- Rotate tokens on sensitive actions
- Monitor suspicious activity

---

## Success Metrics

### Phase 1 Success Criteria
- ✅ Applicants can swipe on jobs
- ✅ Daily swipe limits enforced
- ✅ No duplicate swipes
- ✅ Swipe history tracked
- ✅ API response time < 200ms

### Phase 2 Success Criteria
- ✅ HR can create job postings
- ✅ Jobs appear in applicant deck
- ✅ Listing limits enforced
- ✅ Jobs auto-expire correctly
- ✅ Skills tagged properly

### Phase 3 Success Criteria
- ✅ HR sees prioritized applicants
- ✅ Interview invitations sent
- ✅ Email delivery rate > 95%
- ✅ Application status accurate
- ✅ Message templates work

### Phase 4 Success Criteria
- ✅ Points awarded correctly
- ✅ Queue priority reflects points
- ✅ Redis cache hit rate > 80%
- ✅ Point history accurate
- ✅ No point duplication

### Phase 5 Success Criteria
- ✅ Push notifications delivered
- ✅ Email notifications sent
- ✅ In-app notifications visible
- ✅ Notification preferences work
- ✅ Unread count accurate

### Overall Success Criteria
- ✅ 90% test coverage
- ✅ API uptime > 99.5%
- ✅ Average response time < 200ms
- ✅ Zero critical bugs in production
- ✅ User satisfaction > 4.0/5.0

---

## Next Steps

### Immediate Actions (This Week)
1. Review and approve this roadmap
2. Set up project management board (Jira/Linear)
3. Create feature branches for Phase 1
4. Assign tasks to developers
5. Set up CI/CD pipeline

### Phase 1 Kickoff (Next Week)
1. Implement SwipeCacheRepository
2. Implement SwipeService
3. Implement DeckService
4. Create SwipeController
5. Write integration tests

### Weekly Cadence
- Monday: Sprint planning
- Daily: Standup (15 min)
- Wednesday: Mid-sprint check-in
- Friday: Sprint review + retrospective

### Communication
- Slack: Daily updates
- GitHub: Code reviews
- Notion: Documentation
- Zoom: Weekly meetings

---

## Appendix

### A. Useful Commands

**Development:**
```bash
# Start development server
php artisan serve

# Run queue workers
php artisan horizon

# Run tests
php artisan test

# Code formatting
./vendor/bin/pint

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

**Database:**
```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh database with seeds
php artisan migrate:fresh --seed

# Create migration
php artisan make:migration create_table_name
```

**Code Generation:**
```bash
# Create controller
php artisan make:controller ControllerName

# Create model
php artisan make:model ModelName

# Create service
php artisan make:service ServiceName

# Create repository
php artisan make:repository RepositoryName

# Create job
php artisan make:job JobName

# Create request
php artisan make:request RequestName
```

---

### B. Environment Setup

**Required Software:**
- PHP 8.1+
- Composer 2.x
- PostgreSQL 16
- MongoDB 7
- Redis 7
- Meilisearch
- Docker + Docker Compose

**Environment Variables:**
```env
APP_NAME=JobSwipe
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=jobswipe
DB_USERNAME=postgres
DB_PASSWORD=

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=jobswipe

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=

STRIPE_KEY=
STRIPE_SECRET=
```

---

### C. Troubleshooting

**Common Issues:**

1. **Redis connection failed**
   - Check Redis is running: `redis-cli ping`
   - Verify Redis host/port in `.env`
   - Restart Redis: `redis-server`

2. **MongoDB connection failed**
   - Check MongoDB is running: `mongosh`
   - Verify MongoDB URI in `.env`
   - Restart MongoDB: `brew services restart mongodb-community`

3. **Queue jobs not processing**
   - Check Horizon is running: `php artisan horizon`
   - Check Redis connection
   - Clear failed jobs: `php artisan queue:flush`

4. **Migrations failing**
   - Check database connection
   - Rollback and retry: `php artisan migrate:rollback && php artisan migrate`
   - Check for duplicate migrations

5. **Tests failing**
   - Clear test database: `php artisan migrate:fresh --env=testing`
   - Check test environment variables
   - Run specific test: `php artisan test --filter TestName`

---

### D. Resources

**Documentation:**
- Laravel: https://laravel.com/docs/11.x
- Laravel Sanctum: https://laravel.com/docs/11.x/sanctum
- Laravel Horizon: https://laravel.com/docs/11.x/horizon
- Laravel Scout: https://laravel.com/docs/11.x/scout
- Meilisearch: https://www.meilisearch.com/docs
- MongoDB Laravel: https://www.mongodb.com/docs/drivers/php/laravel-mongodb/

**Tools:**
- Postman: API testing
- TablePlus: Database GUI
- Redis Commander: Redis GUI
- Laravel Telescope: Local debugging
- Laravel Horizon: Queue monitoring

---

## Conclusion

This roadmap provides a comprehensive guide to completing the JobSwipe backend implementation. By following the phased approach and adhering to the technical recommendations, the development team can deliver a robust, scalable, and maintainable application.

**Key Takeaways:**
1. Focus on core swipe functionality first (Phase 1)
2. Build incrementally with tests at each phase
3. Maintain code quality and documentation
4. Monitor performance and errors continuously
5. Iterate based on user feedback

**Estimated Timeline:**
- Phase 1-3 (Critical): 4 weeks
- Phase 4-6 (High Priority): 4 weeks
- Phase 7-9 (Medium Priority): 5 weeks
- Phase 10 (Polish): 1 week
- **Total: 14 weeks (~3.5 months)**

Good luck with the implementation! 🚀

---

*Last Updated: 2026-03-23*  
*Version: 1.0*  
*Author: JobSwipe Development Team*
