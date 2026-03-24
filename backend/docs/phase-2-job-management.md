# Phase 2 — Job Management API

## Overview

Phase 2 adds job posting management for company users. The lifecycle is intentionally simple: HR posts a job (goes live immediately), it stays active until it expires or gets closed, then it can be deleted. All endpoints require authentication via Laravel Sanctum.

---

## Prerequisites

Before testing, make sure you have:

1. **Database migrated** — the `job_postings` and `job_skills` tables must exist:
   ```bash
   php artisan migrate
   ```

2. **A registered user with company role** — register via Phase 1's auth endpoints:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "hr@company.com", "password": "password123", "role": "company_admin"}'
   ```

3. **Email verified and logged in** — you need a Sanctum token:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "hr@company.com", "password": "password123"}'
   ```
   Save the `token` from the response. Use it in all requests below as:
   ```
   Authorization: Bearer <your-token>
   ```

4. **Company profile exists** — the user must have a row in `company_profiles`. If your registration flow doesn't auto-create this, insert one manually or through a seeder.

5. **Meilisearch running** (for create/update/close) — if you're only testing CRUD without search, this is optional.

6. **Queue worker running** (for the scheduled expiration job):
   ```bash
   php artisan queue:work
   ```

---

## Endpoints

### 1. List Job Postings

```
GET /api/v1/company/jobs
Authorization: Bearer <token>
```

Returns paginated list (20 per page) of all job postings for your company, with skills included.

**Query parameters:**
- `page` — page number (default: 1)

---

### 2. Create Job Posting

```
POST /api/v1/company/jobs
Authorization: Bearer <token>
Content-Type: application/json
```

Creates a job posting and **immediately publishes it** (status: `active`). Sets `published_at` to now and `expires_at` to 30 days out. Increments the company's `active_listings_count` and indexes in Meilisearch.

**Request body:**
```json
{
  "title": "Senior Laravel Developer",
  "description": "We are looking for an experienced Laravel developer to join our team. You will be responsible for designing and building scalable APIs, working with PostgreSQL and Redis, and mentoring junior developers.",
  "work_type": "remote",
  "location": null,
  "location_city": null,
  "location_region": null,
  "salary_min": 80000,
  "salary_max": 120000,
  "salary_is_hidden": false,
  "interview_template": "Tell us about a challenging technical problem you solved recently and how you approached it.",
  "skills": [
    {"name": "Laravel", "type": "hard"},
    {"name": "PostgreSQL", "type": "hard"},
    {"name": "Redis", "type": "hard"},
    {"name": "Communication", "type": "soft"}
  ]
}
```

**Validation rules:**
- `title` — required, max 255 characters
- `description` — required, minimum 100 characters
- `work_type` — required, must be `remote`, `hybrid`, or `on_site`
- `location` — required if work_type is `hybrid` or `on_site`
- `salary_min` / `salary_max` — optional, numeric, salary_max must be >= salary_min
- `interview_template` — required, max 1000 characters
- `skills` — required array, 1-20 items, each with `name` (string) and `type` (`hard` or `soft`)

**Returns:** 201 with the created job posting (status will be `active`).

**Error cases:**
- `422` — validation failure (details in response body)
- `403` — `LISTING_LIMIT_REACHED` if on basic tier with 5+ active listings
- `403` — unauthorized role (not company_admin or hr)

---

### 3. Show Job Posting

```
GET /api/v1/company/jobs/{id}
Authorization: Bearer <token>
```

Returns a single job posting with its skills. You can only view postings owned by your company.

---

### 4. Update Job Posting

```
PUT /api/v1/company/jobs/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Only active postings can be edited.** Closed and expired postings are locked — create a new one instead. Updates are re-indexed in Meilisearch automatically.

All fields are optional — send only the fields you want to change:
```json
{
  "title": "Updated Title",
  "salary_max": 150000,
  "skills": [
    {"name": "Laravel", "type": "hard"},
    {"name": "Vue.js", "type": "hard"}
  ]
}
```

If `skills` is provided, it **replaces all existing skills** (delete + re-create). If omitted, existing skills are preserved.

**Error cases:**
- `422` — `INVALID_STATUS` if the posting is not `active`
- `403` — not your company's posting

---

### 5. Delete Job Posting

```
DELETE /api/v1/company/jobs/{id}
Authorization: Bearer <token>
```

Permanently removes a closed or expired posting and its skills (via cascade). **Active postings cannot be deleted** — close them first.

**Error cases:**
- `422` — `INVALID_STATUS` if the posting is `active`
- `403` — not your company's posting

---

### 6. Close Job Posting

```
POST /api/v1/company/jobs/{id}/close
Authorization: Bearer <token>
```

Closes an `active` posting. This is a **terminal action** — once closed, the posting cannot be re-opened or edited. It can only be viewed or deleted.

This:
- Sets status to `closed`
- Decrements `active_listings_count`
- Removes from Meilisearch

**Error cases:**
- `422` — `INVALID_STATUS` if not `active`
- `403` — not your company's posting

---

## Job Posting Lifecycle

```
create ──▶ ACTIVE ──▶ close ──▶ CLOSED ──▶ delete
              │
              └──▶ expires_at reached ──▶ EXPIRED ──▶ delete
```

- **ACTIVE** — visible, searchable, editable
- **CLOSED** — removed from search, locked, can only be viewed or deleted
- **EXPIRED** — auto-set by the hourly scheduled job, locked, can only be viewed or deleted

Want the job back? Close/let it expire, delete it, and post a new one.

---

## Testing with cURL

Here's a full workflow you can copy-paste:

```bash
# Set your token
TOKEN="your-sanctum-token-here"
BASE="http://localhost:8000/api/v1/company"

# 1. Create a job (goes active immediately)
curl -s -X POST "$BASE/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Engineer",
    "description": "Join our engineering team to build scalable microservices with Laravel. You will work on our core API platform serving millions of requests daily and collaborate with frontend and mobile teams.",
    "work_type": "hybrid",
    "location": "San Francisco, CA",
    "location_city": "San Francisco",
    "location_region": "California",
    "salary_min": 90000,
    "salary_max": 140000,
    "salary_is_hidden": false,
    "interview_template": "Describe your experience building REST APIs at scale.",
    "skills": [
      {"name": "PHP", "type": "hard"},
      {"name": "Laravel", "type": "hard"},
      {"name": "Teamwork", "type": "soft"}
    ]
  }' | jq .

# Save the job ID from the response
JOB_ID="paste-the-id-here"

# 2. View it
curl -s "$BASE/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Update the title (re-indexes in Meilisearch)
curl -s -X PUT "$BASE/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Senior Backend Engineer"}' | jq .

# 4. List all jobs
curl -s "$BASE/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 5. Close it (terminal — no going back)
curl -s -X POST "$BASE/jobs/$JOB_ID/close" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 6. Delete it (vanish)
curl -s -X DELETE "$BASE/jobs/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Testing with Postman

1. Create a Postman collection called "JobSwipe Phase 2"
2. Set a collection variable `base_url` = `http://localhost:8000/api/v1`
3. Set a collection variable `token` = your Sanctum token
4. Add an Authorization header to the collection: `Bearer {{token}}`
5. Create requests matching each endpoint above
6. Run them in sequence: Create → Show → Update → List → Close → Delete

---

## Testing the Scheduled Expiration Job

The `ExpireJobPostingsJob` runs hourly and expires any active posting whose `expires_at` has passed.

**To test manually:**

```bash
php artisan tinker
>>> \App\Jobs\ExpireJobPostingsJob::dispatchSync();
```

**To simulate an expired posting:**

```bash
php artisan tinker
>>> $job = \App\Models\PostgreSQL\JobPosting::where('status', 'active')->first();
>>> $job->update(['expires_at' => now()->subDay()]);
>>> \App\Jobs\ExpireJobPostingsJob::dispatchSync();
>>> $job->fresh()->status;  // Should be "expired"
```

**To verify the scheduler is registered:**

```bash
php artisan schedule:list
```

You should see `ExpireJobPostingsJob` listed as running hourly.

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Common error codes from Phase 2:

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `NO_COMPANY_PROFILE` | 403 | User has no company profile |
| `LISTING_LIMIT_REACHED` | 403 | Basic tier cap of 5 active listings |
| `UNAUTHORIZED` | 403 | Posting belongs to a different company |
| `INVALID_STATUS` | 422 | Action not allowed in current status |

Validation errors (422) return Laravel's standard format with field-level details.

---

## Files Created / Modified in Phase 2

| File | Action | Purpose |
|------|--------|---------|
| `app/Models/PostgreSQL/JobSkill.php` | Created | Eloquent model for job skills |
| `app/Http/Requests/Company/CreateJobPostingRequest.php` | Created | Validation for job creation |
| `app/Http/Controllers/Company/JobPostingController.php` | Rewritten | 6 endpoints with direct model access |
| `routes/api.php` | Modified | Registered company job routes |
| `app/Jobs/ExpireJobPostingsJob.php` | Created | Hourly expiration of stale postings |
| `routes/console.php` | Modified | Scheduler registration |
