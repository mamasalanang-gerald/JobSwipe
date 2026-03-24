# JobSwipe Feature Clarifications & Technical Details

> **Document Version:** 1.0  
> **Last Updated:** 2026-03-23  
> **Purpose:** Detailed clarifications on HR workflows, media uploads, location matching, queue management, and points system

---

## Table of Contents

1. [HR Applicant Review Workflow](#1-hr-applicant-review-workflow)
2. [Company Office Photos & Media Management](#2-company-office-photos--media-management)
3. [Location Coordinates & Geo-Matching](#3-location-coordinates--geo-matching)
4. [Production Queue Management with Horizon](#4-production-queue-management-with-horizon)
5. [Social Media Linkage & Points System](#5-social-media-linkage--points-system)

---

## 1. HR Applicant Review Workflow

### Overview

HR reviews applicants **per job posting**, not all applicants at once. The workflow is job-scoped and priority-based.

### Step-by-Step Flow

#### Step 1: HR Dashboard - Job Listing View

HR first sees a list of their active job postings with key metrics:

```
┌─────────────────────────────────────────────────────────┐
│  My Job Postings                                        │
├─────────────────────────────────────────────────────────┤
│  📋 Senior Software Engineer                            │
│     • 24 applicants • 18 pending • 6 invited            │
│     • Status: Active • Expires: 45 days                 │
│     [Review Applicants]                                 │
├─────────────────────────────────────────────────────────┤
│  📋 Product Manager                                     │
│     • 12 applicants • 10 pending • 2 invited            │
│     • Status: Active • Expires: 52 days                 │
│     [Review Applicants]                                 │
└─────────────────────────────────────────────────────────┘
```

**API Endpoint:**
```
GET /api/v1/company/jobs
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "status": "active",
      "published_at": "2026-03-01T10:00:00Z",
      "expires_at": "2026-05-01T10:00:00Z",
      "applicant_count": 24,
      "pending_count": 18,
      "invited_count": 6
    }
  ]
}
```



#### Step 2: Select a Job Posting

HR clicks "Review Applicants" on a specific job to enter the swipe interface for that job.

#### Step 3: Swipe Interface (Job-Scoped)

Once inside a specific job's applicant pool, HR sees:

**Applicant Queue with 5-Tier Priority:**

```
Priority 1: Pro subscribers with 100+ points
Priority 2: Pro subscribers with <100 points
Priority 3: Free users with 50+ points
Priority 4: Free users with 1-49 points
Priority 5: Free users with 0 points
```

Within each tier, applicants are sorted by **application timestamp** (earliest first).

**API Endpoint:**
```
GET /api/v1/company/jobs/{job_id}/applicants?page=1&per_page=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": "application-uuid",
        "applicant_id": "applicant-uuid",
        "status": "applied",
        "created_at": "2026-03-20T14:30:00Z",
        "applicant": {
          "id": "applicant-uuid",
          "user_id": "user-uuid",
          "total_points": 120,
          "subscription_tier": "pro",
          "profile_data": {
            "first_name": "John",
            "last_name": "Doe",
            "profile_photo_url": "https://r2.jobswipe.ph/...",
            "bio": "Experienced software engineer...",
            "skills": [
              {"name": "PHP", "type": "hard"},
              {"name": "Laravel", "type": "hard"}
            ],
            "work_experience": [...],
            "education": [...],
            "resume_url": "https://r2.jobswipe.ph/..."
          }
        }
      }
    ],
    "per_page": 20,
    "total": 24
  }
}
```

#### Step 4: Review Each Applicant Card

Each applicant card displays:

- ✅ Profile photo + name
- ✅ Current job title / most recent experience
- ✅ **Skills** (matched skills highlighted against job requirements)
- ✅ Education summary
- ✅ Points tier indicator (Pro/Basic/Free + point range)
- ✅ Resume download link
- ✅ Tap to expand for full profile

**Skill Matching Example:**
```
Job Requirements: PHP, Laravel, MySQL, Vue.js
Applicant Skills: PHP ✓, Laravel ✓, PostgreSQL, React

Matched: 2/4 (50% match)
```

#### Step 5: Swipe Decision

**Swipe Right → Interview Invitation:**

1. Modal appears with pre-filled interview template
2. HR can edit the message before sending
3. Shortcodes are replaced:
   - `{{applicant_name}}` → "John Doe"
   - `{{job_title}}` → "Senior Software Engineer"
   - `{{company_name}}` → "TechCorp Inc."
4. On confirm:
   - `applications.status` updated to `invited`
   - `applications.invitation_message` saved
   - `applications.invited_at` timestamp set
   - Email + push notification dispatched to applicant
   - `swipe_history` record created in MongoDB

**API Endpoint:**
```
POST /api/v1/company/jobs/{job_id}/swipe/right/{applicant_id}

Request:
{
  "message": "Hi {{applicant_name}}, we're impressed with your background..."
}

Response:
{
  "success": true,
  "message": "Interview invitation sent successfully"
}
```

**Swipe Left → Dismiss:**

1. Applicant dismissed for this posting
2. `hr_swipes` record created (audit log)
3. `swipe_history` record created in MongoDB
4. Applicant remains unaware (no notification)
5. Applicant won't appear again for this job

**API Endpoint:**
```
POST /api/v1/company/jobs/{job_id}/swipe/left/{applicant_id}

Response:
{
  "success": true,
  "message": "Applicant dismissed"
}
```

#### Step 6: Deduplication

**Redis Tracking:**
```
Key: swipe:hr:seen:{hr_user_id}:{job_posting_id}
Type: Set
Members: [applicant_id_1, applicant_id_2, ...]
TTL: 90 days
```

**MongoDB Fallback:**
```json
{
  "user_id": "hr-user-uuid",
  "actor_type": "hr",
  "direction": "left|right",
  "target_id": "applicant-uuid",
  "target_type": "applicant",
  "job_posting_id": "job-uuid",
  "swiped_at": "2026-03-23T10:30:00Z"
}
```

#### Step 7: Switch Between Jobs

HR can navigate back to the job list and review applicants for different job postings. Each job has its own independent applicant queue.

### Key Characteristics

| Aspect | Behavior |
|--------|----------|
| **Scope** | Per job posting (not global) |
| **Pool** | Only applicants who swiped right on that job |
| **Sorting** | 5-tier priority + timestamp |
| **Re-swiping** | Not allowed (Redis + MongoDB deduplication) |
| **Visibility** | HR sees all applicants who applied |
| **Applicant Awareness** | Only notified on right swipe (invitation) |

---

## 2. Company Office Photos & Media Management

### Overview

Companies can upload multiple office/environment photos to showcase their workplace culture. These photos are then selectively featured on individual job postings.

### Storage Architecture

**MongoDB (company_profiles collection):**
```json
{
  "_id": "ObjectId",
  "company_id": "uuid-from-postgres",
  "company_name": "TechCorp Inc.",
  "logo_url": "https://r2.jobswipe.ph/companies/uuid/logo.png",
  "office_images": [
    "https://r2.jobswipe.ph/companies/uuid/office_1.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_2.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_3.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_4.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_5.jpg"
  ]
}
```

**PostgreSQL (job_postings table):**
```sql
-- Job postings reference selected images via JSONB
CREATE TABLE job_postings (
    -- ... other fields
    featured_images JSONB  -- Array of selected image URLs
);
```

### Upload Flow

#### Step 1: Company Profile Setup

**Upload Office Photos:**

```
POST /api/v1/company/profile/office-images

Request (multipart/form-data):
- image: File (max 10MB, JPG/PNG/WEBP)

Response:
{
  "success": true,
  "data": {
    "url": "https://r2.jobswipe.ph/companies/uuid/office_5.jpg",
    "uploaded_at": "2026-03-23T10:30:00Z"
  }
}
```

**Implementation:**
```php
public function uploadOfficeImage(Request $request): JsonResponse
{
    $request->validate([
        'image' => ['required', 'image', 'max:10240', 'mimes:jpg,jpeg,png,webp'],
    ]);
    
    $company = $request->user()->companyProfile;
    $mongoProfile = CompanyProfileDocument::where('company_id', $company->id)->first();
    
    // Check limit (max 15 images)
    $currentImages = $mongoProfile->office_images ?? [];
    if (count($currentImages) >= 15) {
        return $this->error('LIMIT_REACHED', 'Maximum 15 office images allowed', 403);
    }
    
    // Generate pre-signed R2 upload URL
    $filename = Str::uuid() . '.' . $request->file('image')->extension();
    $path = "companies/{$company->id}/office_images/{$filename}";
    
    // Upload to R2
    Storage::disk('r2')->put($path, file_get_contents($request->file('image')));
    $url = Storage::disk('r2')->url($path);
    
    // Add to MongoDB
    $currentImages[] = $url;
    $mongoProfile->update(['office_images' => $currentImages]);
    
    return $this->success(data: ['url' => $url]);
}
```

#### Step 2: Job Posting Creation

**Select Featured Images (1-6):**

When creating a job posting, HR selects which office images to feature:

```
POST /api/v1/company/jobs

Request:
{
  "title": "Senior Software Engineer",
  "description": "...",
  "featured_images": [
    "https://r2.jobswipe.ph/companies/uuid/office_1.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_3.jpg",
    "https://r2.jobswipe.ph/companies/uuid/office_5.jpg"
  ]
}
```

**Validation:**
```php
public function rules(): array
{
    return [
        // ... other rules
        'featured_images' => ['required', 'array', 'min:1', 'max:6'],
        'featured_images.*' => ['required', 'url', 'starts_with:https://r2.jobswipe.ph/'],
    ];
}
```

#### Step 3: Applicant View

When applicants swipe through jobs, they see:

```
┌─────────────────────────────────────────┐
│  [Image Gallery - Swipeable]            │
│  ← Office 1 | Office 3 | Office 5 →     │
├─────────────────────────────────────────┤
│  🏢 TechCorp Inc. ✓                     │
│  📋 Senior Software Engineer            │
│  📍 Makati City, Metro Manila           │
│  💰 ₱80,000 - ₱120,000/month            │
│  🏠 Hybrid                               │
├─────────────────────────────────────────┤
│  Skills: PHP • Laravel • MySQL • Vue.js │
└─────────────────────────────────────────┘
```

### Limits & Constraints

| Resource | Limit | Reason |
|----------|-------|--------|
| **Company Profile** | 10-15 office photos | Storage optimization |
| **Per Job Posting** | 1-6 featured images | UX (swipeable gallery) |
| **File Size** | 10 MB max per image | Performance |
| **Formats** | JPG, PNG, WEBP | Web compatibility |
| **Dimensions** | Recommended 1200x800px | Mobile + web display |

### Delete Office Image

```
DELETE /api/v1/company/profile/office-images/{image_id}

Response:
{
  "success": true,
  "message": "Office image deleted successfully"
}
```

**Note:** Deleting an image from the company profile will NOT affect existing job postings that reference it (URLs remain valid in R2).

---

## 3. Location Coordinates & Geo-Matching

### Overview

Lat/lng coordinates enable geo-based search and location-aware job ranking. The system uses a hybrid approach: text-based matching for simplicity, with geo-coordinates for future advanced features.

### Database Schema

**PostgreSQL (job_postings table):**
```sql
location          VARCHAR(255)    -- "Makati City, Metro Manila"
location_city     VARCHAR(100)    -- "Makati City"
location_region   VARCHAR(100)    -- "Metro Manila"
lat               NUMERIC(9, 6)   -- 14.554729
lng               NUMERIC(9, 6)   -- 121.024445
```

**Indexes:**
```sql
CREATE INDEX idx_job_postings_location_city ON job_postings(location_city);
CREATE INDEX idx_job_postings_location_region ON job_postings(location_region);
```

### How Coordinates Are Obtained

#### Option 1: Geocoding API (Recommended)

When HR enters a location during job posting creation:

```php
use Illuminate\Support\Facades\Http;

public function geocodeLocation(string $location): ?array
{
    // Using Google Maps Geocoding API
    $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
        'address' => $location . ', Philippines',
        'key' => config('services.google_maps.key'),
    ]);
    
    if ($response->successful() && !empty($response->json()['results'])) {
        $result = $response->json()['results'][0];
        
        return [
            'lat' => $result['geometry']['location']['lat'],
            'lng' => $result['geometry']['location']['lng'],
            'formatted_address' => $result['formatted_address'],
            'city' => $this->extractCity($result['address_components']),
            'region' => $this->extractRegion($result['address_components']),
        ];
    }
    
    return null;
}

private function extractCity(array $components): ?string
{
    foreach ($components as $component) {
        if (in_array('locality', $component['types']) || 
            in_array('administrative_area_level_2', $component['types'])) {
            return $component['long_name'];
        }
    }
    return null;
}

private function extractRegion(array $components): ?string
{
    foreach ($components as $component) {
        if (in_array('administrative_area_level_1', $component['types'])) {
            return $component['long_name'];
        }
    }
    return null;
}
```

**Example Response:**
```json
{
  "lat": 14.554729,
  "lng": 121.024445,
  "formatted_address": "Makati, Metro Manila, Philippines",
  "city": "Makati City",
  "region": "Metro Manila"
}
```

#### Option 2: Philippine Cities Lookup Table

Pre-populate a lookup table for major Philippine cities:

```php
// database/seeders/PhilippineCitiesSeeder.php
$cities = [
    ['name' => 'Makati City', 'region' => 'Metro Manila', 'lat' => 14.554729, 'lng' => 121.024445],
    ['name' => 'Quezon City', 'region' => 'Metro Manila', 'lat' => 14.676208, 'lng' => 121.043861],
    ['name' => 'Cebu City', 'region' => 'Central Visayas', 'lat' => 10.315699, 'lng' => 123.885437],
    ['name' => 'Davao City', 'region' => 'Davao Region', 'lat' => 7.190708, 'lng' => 125.455341],
    ['name' => 'Taguig', 'region' => 'Metro Manila', 'lat' => 14.517221, 'lng' => 121.073059],
    // ... more cities
];
```

**Usage:**
```php
$cityData = DB::table('philippine_cities')
    ->where('name', 'Makati City')
    ->first();
```

### Location Matching Strategies

#### v1: Text-Based Matching (Current)

Simple and fast, no complex geo calculations:

```php
// DeckService.php
public function getJobDeck(string $userId, int $perPage = 20): array
{
    $applicant = ApplicantProfile::where('user_id', $userId)->first();
    $mongoProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
    
    $applicantCity = $mongoProfile->location_city;
    
    $jobs = JobPosting::active()
        ->whereNotIn('id', $this->getSeenJobIds($userId))
        ->get()
        ->map(function ($job) use ($applicantCity, $mongoProfile) {
            // Calculate relevance
            $skillScore = $this->calculateSkillMatch($job, $mongoProfile->skills);
            $recencyScore = $this->calculateRecencyScore($job);
            
            // Location bonus: +0.1 if same city
            $locationBonus = ($job->location_city === $applicantCity) ? 0.1 : 0;
            
            // Remote jobs always get +0.05 bonus
            $remoteBonus = ($job->work_type === 'remote') ? 0.05 : 0;
            
            $job->relevance_score = 
                ($skillScore * 0.7) + 
                ($recencyScore * 0.3) + 
                $locationBonus + 
                $remoteBonus;
            
            return $job;
        })
        ->sortByDesc('relevance_score')
        ->take($perPage)
        ->values();
    
    return $jobs;
}
```

**Relevance Formula:**
```
Score = (skill_match * 0.7) + (recency * 0.3) + location_bonus + remote_bonus

Where:
- skill_match: 0.0 to 1.0 (percentage of matched skills)
- recency: 0.4 to 1.0 (based on days since published)
- location_bonus: 0.1 if same city, 0 otherwise
- remote_bonus: 0.05 if remote, 0 otherwise
```

#### v2: Geo-Radius Search (Future)

Using Meilisearch for advanced geo-filtering:

**Meilisearch Index:**
```php
// JobPosting.php
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
        '_geo' => $this->lat && $this->lng ? [
            'lat' => (float) $this->lat,
            'lng' => (float) $this->lng
        ] : null,
        'published_at' => $this->published_at?->timestamp,
    ];
}
```

**Geo-Radius Query:**
```php
use Laravel\Scout\Builder;

public function searchJobsNearby(float $lat, float $lng, int $radiusMeters = 10000): Collection
{
    return JobPosting::search('', function (Builder $builder) use ($lat, $lng, $radiusMeters) {
        return $builder->with([
            'filter' => 'status = active',
            '_geoRadius' => [
                'lat' => $lat,
                'lng' => $lng,
                'radius' => $radiusMeters,  // 10km
            ],
        ]);
    })->get();
}
```

**Applicant Preferences (Future):**
```json
{
  "location_preferences": {
    "preferred_radius_km": 10,
    "willing_to_relocate": false,
    "open_to_remote": true
  }
}
```

### Distance Calculation (Haversine Formula)

For displaying distance on job cards:

```php
public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
{
    $earthRadius = 6371; // km
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLng / 2) * sin($dLng / 2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    
    return $earthRadius * $c; // Distance in km
}
```

**Usage:**
```php
$distance = $this->calculateDistance(
    $applicantLat, $applicantLng,
    $jobLat, $jobLng
);

// Display: "5.2 km away" or "Remote"
```

### Location Display Examples

**Job Card:**
```
📍 Makati City, Metro Manila (5.2 km away)
📍 Quezon City, Metro Manila (12.8 km away)
📍 Remote (Work from anywhere)
📍 Hybrid - Taguig (8.1 km away)
```

---


## 4. Production Queue Management with Horizon

### Overview

Laravel Horizon manages Redis-based queues for background job processing. In production, Horizon must run as a supervised daemon process to ensure reliability and automatic recovery.

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Laravel Application                   │
│  (Dispatches jobs to Redis queues)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Redis Server                          │
│  Queues:                                                 │
│  • queue:default (general jobs)                         │
│  • queue:notifications (high priority)                  │
│  • queue:emails (email dispatch)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Laravel Horizon (Daemon)                    │
│  • Managed by Supervisor                                 │
│  • Auto-restart on failure                               │
│  • Multiple workers per queue                            │
└─────────────────────────────────────────────────────────┘
```

### Supervisor Configuration

#### Install Supervisor

```bash
# Ubuntu/Debian
sudo apt-get install supervisor

# CentOS/RHEL
sudo yum install supervisor

# Start Supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

#### Create Horizon Configuration

**File:** `/etc/supervisor/conf.d/horizon.conf`

```ini
[program:horizon]
process_name=%(program_name)s
command=php /var/www/jobswipe/artisan horizon
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/jobswipe/storage/logs/horizon.log
stopwaitsecs=3600
```

**Configuration Breakdown:**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `process_name` | `horizon` | Process identifier |
| `command` | `php artisan horizon` | Command to run |
| `autostart` | `true` | Start on boot |
| `autorestart` | `true` | Restart on crash |
| `user` | `www-data` | Run as web server user |
| `numprocs` | `1` | Single Horizon instance |
| `stopwaitsecs` | `3600` | Wait 1 hour for graceful shutdown |
| `stdout_logfile` | Log path | Where to write logs |

#### Load and Start Horizon

```bash
# Reload Supervisor configuration
sudo supervisorctl reread

# Update Supervisor with new config
sudo supervisorctl update

# Start Horizon
sudo supervisorctl start horizon

# Check status
sudo supervisorctl status horizon
```

**Expected Output:**
```
horizon    RUNNING   pid 12345, uptime 0:05:23
```

### Horizon Configuration

**File:** `config/horizon.php`

```php
<?php

return [
    'prefix' => env('HORIZON_PREFIX', 'jobswipe:'),
    
    'use' => 'default',
    
    'waits' => [
        'redis:default' => 60,
        'redis:notifications' => 30,
    ],
    
    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'failed' => 10080, // 7 days
    ],
    
    'fast_termination' => false,
    
    'memory_limit' => 64,
    
    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['notifications', 'default', 'emails'],
                'balance' => 'auto',
                'processes' => 10,
                'tries' => 3,
                'timeout' => 300,
                'nice' => 0,
            ],
        ],
        
        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'auto',
                'processes' => 3,
                'tries' => 3,
                'timeout' => 60,
            ],
        ],
    ],
];
```

**Key Settings:**

- **`queue`**: Priority order (notifications → default → emails)
- **`processes`**: 10 worker processes in production
- **`tries`**: Retry failed jobs 3 times
- **`timeout`**: Kill jobs after 5 minutes
- **`balance`**: Auto-balance workers across queues

### Queue Priority

Jobs are processed in this order:

1. **`notifications`** (highest priority)
   - Interview invitations
   - Push notifications
   - Critical alerts

2. **`default`** (medium priority)
   - Point recalculations
   - Profile updates
   - General background tasks

3. **`emails`** (lower priority)
   - Transactional emails
   - Newsletters
   - Digest emails

### Deployment Process

When deploying new code, you **must** restart Horizon to load the new code:

```bash
# In your deployment script (deploy.sh)

# Pull latest code
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Terminate Horizon gracefully
php artisan horizon:terminate

# Supervisor will automatically restart Horizon
# Wait for restart
sleep 5

# Verify Horizon is running
sudo supervisorctl status horizon
```

**Important:** `php artisan horizon:terminate` sends a graceful shutdown signal. Horizon will:
1. Stop accepting new jobs
2. Finish processing current jobs (up to `stopwaitsecs`)
3. Exit cleanly
4. Supervisor automatically restarts it

### Monitoring & Health Checks

#### Horizon Dashboard

Access at: `https://api.jobswipe.ph/horizon`

**Protect with middleware:**
```php
// app/Providers/HorizonServiceProvider.php

protected function gate(): void
{
    Gate::define('viewHorizon', function ($user) {
        return in_array($user->email, [
            'admin@jobswipe.ph',
            'devops@jobswipe.ph',
        ]);
    });
}
```

**Dashboard Features:**
- Real-time job throughput
- Failed job list
- Job metrics (wait time, runtime)
- Worker status
- Queue lengths

#### Health Check Endpoint

```php
// routes/api.php
Route::get('/health/horizon', function () {
    $masters = Horizon::masters();
    
    if (empty($masters)) {
        return response()->json([
            'status' => 'down',
            'message' => 'No Horizon masters running'
        ], 503);
    }
    
    return response()->json([
        'status' => 'up',
        'masters' => count($masters),
        'timestamp' => now()
    ]);
});
```

**Monitor with cron:**
```bash
# /etc/cron.d/horizon-health
*/5 * * * * curl -f https://api.jobswipe.ph/health/horizon || echo "Horizon is down!" | mail -s "Horizon Alert" devops@jobswipe.ph
```

#### Failed Jobs Monitoring

```php
// app/Jobs/MonitorFailedJobs.php
class MonitorFailedJobs implements ShouldQueue
{
    public function handle(): void
    {
        $failedCount = DB::table('failed_jobs')
            ->where('failed_at', '>', now()->subHour())
            ->count();
        
        if ($failedCount > 10) {
            // Alert via Sentry or email
            Sentry::captureMessage("High failed job count: {$failedCount}");
        }
    }
}

// Schedule in app/Console/Kernel.php
$schedule->job(new MonitorFailedJobs)->hourly();
```

### Redis Configuration for Production

**File:** `config/database.php`

```php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),  // Faster than predis
    
    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', 'jobswipe:'),
    ],
    
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
        'read_timeout' => 60,
        'retry_interval' => 100,
    ],
    
    'cache' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'),
    ],
],
```

**Redis Persistence (redis.conf):**
```conf
# Save to disk periodically
save 900 1       # After 900 sec if 1 key changed
save 300 10      # After 300 sec if 10 keys changed
save 60 10000    # After 60 sec if 10000 keys changed

# AOF (Append Only File) for durability
appendonly yes
appendfsync everysec

# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### Scaling Horizon

#### Vertical Scaling (Single Server)

Increase worker processes:

```php
// config/horizon.php
'production' => [
    'supervisor-1' => [
        'processes' => 20,  // Increase from 10 to 20
        'memory_limit' => 128,
    ],
],
```

#### Horizontal Scaling (Multiple Servers)

Run Horizon on multiple servers:

**Server 1:**
```ini
[program:horizon-server1]
command=php /var/www/jobswipe/artisan horizon
```

**Server 2:**
```ini
[program:horizon-server2]
command=php /var/www/jobswipe/artisan horizon
```

Both connect to the same Redis instance. Horizon automatically coordinates workers.

### Troubleshooting

#### Horizon Not Processing Jobs

```bash
# Check if Horizon is running
sudo supervisorctl status horizon

# Check Horizon logs
tail -f /var/www/jobswipe/storage/logs/horizon.log

# Check Redis connection
redis-cli ping

# Check queue length
redis-cli LLEN jobswipe:queue:default
```

#### Jobs Stuck in Queue

```bash
# Clear failed jobs
php artisan horizon:clear

# Restart Horizon
php artisan horizon:terminate
sudo supervisorctl restart horizon
```

#### High Memory Usage

```bash
# Check worker memory
ps aux | grep horizon

# Reduce processes or increase memory limit
# config/horizon.php
'memory_limit' => 128,  // Increase from 64
```

### Best Practices

1. **Always use Supervisor** in production (never run `php artisan horizon` manually)
2. **Terminate gracefully** on deployment (`php artisan horizon:terminate`)
3. **Monitor failed jobs** with alerts
4. **Set appropriate timeouts** (5 minutes for most jobs)
5. **Use queue priorities** (notifications > default > emails)
6. **Enable Redis persistence** (AOF + RDB)
7. **Scale horizontally** when needed (multiple Horizon instances)
8. **Log everything** to Sentry for debugging

---

## 5. Social Media Linkage & Points System

### Overview

Applicants can link their social media profiles to earn points and showcase their online presence. The system awards points for LinkedIn (20 points) and up to 3 other social platforms (5 points each).

### Database Structure

#### MongoDB (applicant_profiles collection)

```json
{
  "_id": "ObjectId",
  "user_id": "uuid-from-postgres",
  "first_name": "John",
  "last_name": "Doe",
  "social_links": [
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/johndoe",
      "linked_at": "2026-03-23T10:30:00Z"
    },
    {
      "platform": "github",
      "url": "https://github.com/johndoe",
      "linked_at": "2026-03-23T10:35:00Z"
    },
    {
      "platform": "twitter",
      "url": "https://twitter.com/johndoe",
      "linked_at": "2026-03-23T10:40:00Z"
    }
  ]
}
```

#### PostgreSQL (point_events table)

```sql
-- LinkedIn (special treatment)
INSERT INTO point_events (applicant_id, event_type, points, description)
VALUES ('uuid', 'linkedin_linked', 20, 'LinkedIn profile linked');

-- Other social media (max 3)
INSERT INTO point_events (applicant_id, event_type, points, description)
VALUES ('uuid', 'social_linked', 5, 'GitHub profile linked');

INSERT INTO point_events (applicant_id, event_type, points, description)
VALUES ('uuid', 'social_linked', 5, 'Twitter profile linked');

INSERT INTO point_events (applicant_id, event_type, points, description)
VALUES ('uuid', 'social_linked', 5, 'Portfolio website linked');
```

### Point Award Rules

| Event | Points | Limit | Repeatable |
|-------|--------|-------|------------|
| **LinkedIn linked** | 20 | 1 time | No |
| **Social media linked** | 5 each | 3 platforms max | No (per platform) |

**Total Possible:** 20 (LinkedIn) + 15 (3 × social) = **35 points**

### Unique Constraint

**PostgreSQL Partial Index:**
```sql
CREATE UNIQUE INDEX idx_point_events_onetime
ON point_events (applicant_id, event_type)
WHERE event_type NOT IN ('subscribed_basic', 'subscribed_pro', 'bonus_pro');
```

This ensures:
- ✅ LinkedIn can only be linked once (20 points awarded once)
- ✅ Each social platform can only be linked once (5 points per platform)
- ✅ Subscription events can repeat (monthly renewals)

### Supported Platforms

```php
const ALLOWED_PLATFORMS = [
    'linkedin',    // 20 points (special)
    'github',      // 5 points
    'twitter',     // 5 points
    'facebook',    // 5 points
    'instagram',   // 5 points
    'portfolio',   // 5 points (personal website)
];
```

### Implementation

#### API Endpoint

```
POST /api/v1/applicant/profile/social-link

Request:
{
  "platform": "github",
  "url": "https://github.com/johndoe"
}

Response (Success):
{
  "success": true,
  "data": {
    "platform": "github",
    "url": "https://github.com/johndoe",
    "points_awarded": 5,
    "total_points": 85
  },
  "message": "GitHub profile linked successfully"
}

Response (Already Linked):
{
  "success": false,
  "code": "ALREADY_LINKED",
  "message": "GitHub profile is already linked"
}

Response (Max Limit):
{
  "success": false,
  "code": "LIMIT_REACHED",
  "message": "Maximum 3 social media links reached (excluding LinkedIn)"
}
```

#### ProfileService Implementation

```php
// app/Services/ProfileService.php

public function linkSocialMedia(string $userId, string $platform, string $url): array
{
    $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();
    $mongoProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
    
    // Validate platform
    $allowedPlatforms = ['linkedin', 'github', 'twitter', 'facebook', 'instagram', 'portfolio'];
    if (!in_array($platform, $allowedPlatforms)) {
        return [
            'success' => false,
            'message' => 'Invalid platform. Allowed: ' . implode(', ', $allowedPlatforms)
        ];
    }
    
    // Validate URL format
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return ['success' => false, 'message' => 'Invalid URL format'];
    }
    
    // Check if already linked
    $existingLinks = $mongoProfile->social_links ?? [];
    $alreadyLinked = collect($existingLinks)->contains('platform', $platform);
    
    if ($alreadyLinked) {
        return [
            'success' => false,
            'code' => 'ALREADY_LINKED',
            'message' => ucfirst($platform) . ' profile is already linked'
        ];
    }
    
    // Check max social links (3 excluding LinkedIn)
    $nonLinkedInCount = collect($existingLinks)
        ->where('platform', '!=', 'linkedin')
        ->count();
    
    if ($platform !== 'linkedin' && $nonLinkedInCount >= 3) {
        return [
            'success' => false,
            'code' => 'LIMIT_REACHED',
            'message' => 'Maximum 3 social media links reached (excluding LinkedIn)'
        ];
    }
    
    // Add to MongoDB
    $existingLinks[] = [
        'platform' => $platform,
        'url' => $url,
        'linked_at' => now()->toISOString(),
    ];
    
    $mongoProfile->update(['social_links' => $existingLinks]);
    
    // Award points
    try {
        if ($platform === 'linkedin') {
            $pointsAwarded = 20;
            $this->pointService->awardPoints(
                $applicant->id,
                'linkedin_linked',
                'LinkedIn profile linked'
            );
        } else {
            $pointsAwarded = 5;
            $this->pointService->awardPoints(
                $applicant->id,
                'social_linked',
                ucfirst($platform) . ' profile linked'
            );
        }
    } catch (\Exception $e) {
        // Point already awarded (duplicate), but link was added to MongoDB
        $pointsAwarded = 0;
    }
    
    // Get updated total points
    $applicant->refresh();
    
    return [
        'success' => true,
        'data' => [
            'platform' => $platform,
            'url' => $url,
            'points_awarded' => $pointsAwarded,
            'total_points' => $applicant->total_points,
        ],
        'message' => ucfirst($platform) . ' profile linked successfully'
    ];
}
```

#### Controller

```php
// app/Http/Controllers/Applicant/ProfileController.php

public function linkSocialMedia(LinkSocialMediaRequest $request): JsonResponse
{
    $result = $this->profileService->linkSocialMedia(
        $request->user()->id,
        $request->platform,
        $request->url
    );
    
    if (!$result['success']) {
        $statusCode = match ($result['code'] ?? null) {
            'ALREADY_LINKED' => 409,
            'LIMIT_REACHED' => 403,
            default => 422,
        };
        
        return $this->error(
            $result['code'] ?? 'VALIDATION_ERROR',
            $result['message'],
            $statusCode
        );
    }
    
    return $this->success(
        data: $result['data'],
        message: $result['message']
    );
}
```

#### Request Validation

```php
// app/Http/Requests/Applicant/LinkSocialMediaRequest.php

public function rules(): array
{
    return [
        'platform' => [
            'required',
            'string',
            Rule::in(['linkedin', 'github', 'twitter', 'facebook', 'instagram', 'portfolio']),
        ],
        'url' => [
            'required',
            'url',
            'max:255',
        ],
    ];
}

public function messages(): array
{
    return [
        'platform.in' => 'Platform must be one of: linkedin, github, twitter, facebook, instagram, portfolio',
        'url.url' => 'Please provide a valid URL',
    ];
}
```

### Unlinking Social Media

```
DELETE /api/v1/applicant/profile/social-link/{platform}

Response:
{
  "success": true,
  "message": "GitHub profile unlinked successfully"
}
```

**Note:** Unlinking does NOT deduct points. Points are permanent once awarded.

```php
public function unlinkSocialMedia(string $userId, string $platform): array
{
    $mongoProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
    
    $existingLinks = $mongoProfile->social_links ?? [];
    $updatedLinks = collect($existingLinks)
        ->reject(fn($link) => $link['platform'] === $platform)
        ->values()
        ->toArray();
    
    $mongoProfile->update(['social_links' => $updatedLinks]);
    
    return [
        'success' => true,
        'message' => ucfirst($platform) . ' profile unlinked successfully'
    ];
}
```

### Display in Applicant Profile

When HR views an applicant profile:

```json
{
  "applicant": {
    "name": "John Doe",
    "total_points": 85,
    "social_links": [
      {
        "platform": "linkedin",
        "url": "https://linkedin.com/in/johndoe",
        "icon": "linkedin"
      },
      {
        "platform": "github",
        "url": "https://github.com/johndoe",
        "icon": "github"
      },
      {
        "platform": "twitter",
        "url": "https://twitter.com/johndoe",
        "icon": "twitter"
      }
    ]
  }
}
```

**Frontend Display:**
```
┌─────────────────────────────────────┐
│  John Doe                           │
│  85 points • Pro Subscriber         │
├─────────────────────────────────────┤
│  🔗 Social Links:                   │
│  [in] LinkedIn                      │
│  [gh] GitHub                        │
│  [tw] Twitter                       │
└─────────────────────────────────────┘
```

### Point Tracking

**Get Point History:**
```
GET /api/v1/applicant/points/history

Response:
{
  "success": true,
  "data": [
    {
      "event_type": "linkedin_linked",
      "points": 20,
      "description": "LinkedIn profile linked",
      "created_at": "2026-03-23T10:30:00Z"
    },
    {
      "event_type": "social_linked",
      "points": 5,
      "description": "GitHub profile linked",
      "created_at": "2026-03-23T10:35:00Z"
    },
    {
      "event_type": "resume_uploaded",
      "points": 30,
      "description": "Resume uploaded",
      "created_at": "2026-03-22T14:20:00Z"
    }
  ],
  "total_points": 85
}
```

---

## Summary

This document clarifies key JobSwipe features:

1. **HR Applicant Review:** Job-scoped workflow with 5-tier priority queue
2. **Company Photos:** Multiple office images (10-15) with selective job posting features (1-6)
3. **Location Matching:** Hybrid text + geo-coordinate approach with future Meilisearch integration
4. **Horizon Production:** Supervisor-managed daemon with graceful restarts and monitoring
5. **Social Media Points:** LinkedIn (20 pts) + 3 social platforms (5 pts each) with deduplication

All features are designed for scalability, reliability, and excellent user experience.

---

*Document Version: 1.0*  
*Last Updated: 2026-03-23*  
*Author: JobSwipe Development Team*
