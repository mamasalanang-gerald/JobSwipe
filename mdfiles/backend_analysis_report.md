# JobSwipe Backend — Comprehensive Code Analysis Report

> **Analyzed:** 2026-03-30  
> **Framework:** Laravel 11 (PHP)  
> **Databases:** PostgreSQL 16, MongoDB, Redis 7  
> **Completion:** ~30–35% of documented features implemented

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture — Good Sides](#2-architecture--good-sides)
3. [Security Vulnerabilities](#3-security-vulnerabilities)
4. [Bugs & Code Issues](#4-bugs--code-issues)
5. [Design Criticisms](#5-design-criticisms)
6. [Missing Features vs Documentation](#6-missing-features-vs-documentation)
7. [Recommendations & Priority Matrix](#7-recommendations--priority-matrix)

---

## 1. Executive Summary

The backend has a **solid architectural foundation** — clean service/repository pattern, multi-database design, and proper separation of concerns. However, it contains **several security vulnerabilities** (some critical), **at least 5 concrete bugs**, and is missing roughly **65–70%** of the features described in the project documentation. The codebase quality is above average for its maturity stage, but the gaps between what the docs promise and what exists are significant.

### At a Glance

| Category | Assessment |
|---|---|
| **Architecture** | ⭐⭐⭐⭐ Strong — Service/Repo pattern, multi-DB |
| **Security** | ⭐⭐ Weak — Critical exposed debug routes, missing rate-limiting |
| **Code Quality** | ⭐⭐⭐ Decent — Mostly clean, some inconsistencies |
| **Test Coverage** | ⭐ Very Low — Test directory exists but is essentially empty |
| **Feature Completeness** | ⭐⭐ ~30–35% vs documentation |

---

## 2. Architecture — Good Sides

### ✅ Clean Service/Repository Pattern

The codebase follows a proper layered architecture:

```
Controller → Service → Repository → Model/Eloquent
```

This is well-executed. Controllers are thin, services hold business logic, and repositories abstract data access. This makes the code testable and maintainable.

**Example:** [SwipeService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php) — cleanly orchestrates Redis cache, MongoDB audit trail, and PostgreSQL application records within a single swipe action.

### ✅ Multi-Database Strategy is Sound

The decision to split data across three databases is well-justified:

| Database | What it stores | Why it fits |
|---|---|---|
| **PostgreSQL** | Users, subscriptions, applications, payments | ACID, relational integrity |
| **MongoDB** | Profile documents, swipe history | Flexible schema, nested documents |
| **Redis** | Rate limiting, deduplication, counters, caching | Speed, ephemeral data |

The **cache-with-fallback** pattern is consistently applied — Redis is always checked first, with MongoDB/Postgres as durable source of truth. See [SwipeCacheRepository.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Repositories/Redis/SwipeCacheRepository.php).

### ✅ Well-Designed Cursor-Based Pagination for the Deck

[DeckService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/DeckService.php) uses proper **cursor-based pagination** (not offset-based), which is the correct pattern for infinite-scroll swipe decks. The cursor encodes `published_at + job_id` for stable ordering. This scales well.

### ✅ Stripe Idempotency Handling is Mature

The [SubscriptionService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php) has a robust idempotency mechanism for checkout sessions — using DB-level reservation with `lockForUpdate()`, fingerprint comparison, and TTL-based expiration. This prevents duplicate charges properly. This is production-grade payment handling.

### ✅ Webhook Deduplication for Stripe Events

The `reserveWebhookEvent()` method in SubscriptionService uses a dedicated `stripe_webhook_events` table with unique constraints to ensure each Stripe event is processed exactly once. This is correct.

### ✅ OTP Hashing

OTPs are hashed with SHA-256 before being stored in Redis, and verified using `hash_equals()` to prevent timing attacks. Registration data is stored in Redis rather than the database until verification completes, which is a clean pattern.

### ✅ User Data Cleanup on Deletion

[UserDataCleanupService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/UserDataCleanupService.php) properly cascades deletion across all three databases (PostgreSQL, MongoDB, Redis), triggered via Eloquent's `deleting` event. This addresses GDPR/DPA compliance concerns.

### ✅ Proper UUID Primary Keys

All models use UUID PKs with `$incrementing = false` and `$keyType = 'string'`. UUIDs are generated in the model's `creating` boot event. This is good for distributed systems and avoids Sequential ID enumeration attacks.

### ✅ Job Expiration with Meilisearch Cleanup

[ExpireJobPostingsJob.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Jobs/ExpireJobPostingsJob.php) properly chunks processing, removes expired jobs from the search index (`unsearchable()`), and handles per-record failures gracefully so one bad record doesn't block others.

---

## 3. Security Vulnerabilities

### 🔴 CRITICAL: Debug Endpoints Exposed Without Authentication

**Files:** [api.php L22-182](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/routes/api.php#L22-L182)

```
GET  /api/clear-cache         — Clears ALL caches
GET  /api/debug/email-config  — Dumps mail/Redis/queue config
POST /api/debug/test-email    — Sends arbitrary test emails
GET  /api/debug/database      — Dumps ALL table names, row counts, Redis keys
```

These endpoints are **completely unauthenticated** and expose:
- Full database table listing with row counts
- Redis key enumeration
- SMTP credentials status
- Queue configuration internals
- Stack traces on error

> [!CAUTION]
> **Any of these endpoints in production would constitute a severe information disclosure vulnerability.** The `clear-cache` endpoint is also a trivial DoS vector — an attacker could repeatedly clear caches to degrade performance. The `test-email` endpoint can be used for spam relay.

**Fix:** Delete them entirely, or at minimum wrap them in `auth:sanctum` + `role:super_admin` middleware and add `APP_DEBUG` environment checks.

---

### 🔴 CRITICAL: No API Rate Limiting Implemented

**Documentation says:** *"Rate limiting via Redis: 60 req/min per authenticated user, 20 req/min unauthenticated."*

**Reality:** **Zero rate limiting exists anywhere in the codebase.** There is no `ThrottleRequests` middleware, no `RateLimiter` registration in `AppServiceProvider`, no custom rate-limiting logic.

This means:
- Login endpoint is vulnerable to **brute-force attacks**
- OTP verification can be hammered (although OTPService has a 5-attempt cap per email, there's nothing stopping an attacker from trying thousands of different email addresses or rapidly re-triggering OTP sends)
- Swipe endpoints can be abused at wire speed
- The API is fully exposed to application-layer DDoS

---

### 🟡 HIGH: Stripe Webhook Endpoint Has No Signature Verification Bypass Protection

The [webhook handler](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#L57-L77) correctly verifies `Stripe-Signature`, but the route `POST /api/v1/webhooks/stripe` is inside the `v1` prefix group yet **outside** the `auth:sanctum` middleware group (correct for webhooks). However, it has **no CSRF exemption configured** and no IP allowlisting. While Stripe signature verification protects against tampering, consider adding Stripe IP range allowlisting at the infrastructure level.

---

### 🟡 HIGH: Duplicate Role-Checking Middleware

Two separate middleware classes do nearly the same thing:
- [CheckRole.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Http/Middleware/CheckRole.php) — registered as `role`
- [EnsureRole.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Http/Middleware/EnsureRole.php) — appears to be a duplicate

`EnsureRole` uses a **non-strict** `in_array()` (no `true` third argument), which could theoretically cause type-juggling issues in edge cases. This isn't a direct exploit vector with string roles, but it's a code smell. `CheckRole` uses strict comparison and is the one actively used in routes.

---

### 🟡 HIGH: No Forgot-Password / Reset-Password Implementation

The [documentation](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/mdfiles/documentation.md) specifies:

```
POST /auth/forgot-password
POST /auth/reset-password
```

**Neither endpoint exists in the codebase.** There is no password reset flow at all. Users who forget their password are currently locked out permanently (unless they signed up via Google OAuth).

---

### 🟡 MEDIUM: CORS Allows Wildcard Headers

In [cors.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/config/cors.php):

```php
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
```

While `allowed_origins` is properly restricted, `allowed_headers: *` and `allowed_methods: *` is unnecessarily permissive. Tighten these to only the headers and methods actually used.

---

### 🟡 MEDIUM: `error_log()` Call in Production Code

In [OTPService.php L18](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/OTPService.php#L18):

```php
error_log('=== OTP SERVICE: Sending OTP to '.$email.' ===');
```

This writes PII (email addresses) directly to the PHP error log, bypassing Laravel's logging channel configuration. In production, this may end up in web server error logs where it shouldn't be.

---

## 4. Bugs & Code Issues

### 🐛 Bug 1: Field Name Mismatch — `extra_swipe_balance` vs `extra_swipes_balance`

The database migration and documentation use `extra_swipes_balance` (plural), but the codebase is inconsistent:

| Location | Field Name Used |
|---|---|
| [ApplicantProfile model (fillable)](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Models/PostgreSQL/ApplicantProfile.php#L21) | `extra_swipe_balance` (singular) |
| [SwipeService.php L170](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php#L170) | `extra_swipe_balance` (singular) |
| [CheckSwipeLimit middleware L46](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Http/Middleware/CheckSwipeLimit.php#L46) | `extra_swipe_balance` (singular) |
| [ProfileService.php L348](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L348) | `extra_swipes_balance` (plural) |
| Documentation schema | `extra_swipes_balance` (plural) |

**Impact:** If the actual DB column is `extra_swipes_balance` (as per migration), then `SwipeService`, `ApplicantProfile` model, and `CheckSwipeLimit` will silently return `null` when reading that field, **causing the swipe limit check to silently fail** — users would never be able to use their extra swipes.

---

### 🐛 Bug 2: Transaction Doesn't Cover Both Databases

In [SwipeService::applicantSwipeRight()](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php#L37-L55):

```php
DB::transaction(function () use ($userId, $applicant, $jobId) {
    $this->swipeHistory->recordSwipe([...]); // MongoDB write
    $this->applications->create(...);        // PostgreSQL write
    $applicant->increment('daily_swipes_used');
});
```

`DB::transaction()` wraps only the **PostgreSQL** connection. The MongoDB `recordSwipe()` call inside it is **not transactional** — if the PostgreSQL write fails and rolls back, the MongoDB document persists, creating a data inconsistency. The Redis cache updates at L58-59 are outside the transaction, which is correct, but the MongoDB leak inside the transaction block gives a false sense of atomicity.

---

### 🐛 Bug 3: Left Swipe Doesn't Use a Transaction But Should

In [SwipeService::applicantSwipeLeft()](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php#L80-L96):

The MongoDB write and PostgreSQL `increment('daily_swipes_used')` are **not** wrapped in a transaction at all. If `increment()` fails, the MongoDB swipe record exists but the counter isn't updated — or vice versa, the counter increments but the swipe wasn't recorded.

---

### 🐛 Bug 4: `Redis::keys()` in Production — Performance Bomb

In [ResetDailySwipesJob.php L29-33](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Jobs/ResetDailySwipesJob.php#L29-L33):

```php
$keys = Redis::keys('swipe:counter:*');
if (!empty($keys)) {
    Redis::del(...$keys);
}
```

`KEYS *` is an **O(N) blocking command** that scans the entire Redis keyspace. In production with significant data, this can block Redis for seconds, causing cascading timeouts across the entire application. 

**Fix:** Use `SCAN` with iteration, or simply let the TTL on counter keys handle expiration (they already expire at midnight PHT — this cleanup is redundant).

The same pattern appears in [UserDataCleanupService.php L38-45](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/UserDataCleanupService.php#L38-L45).

---

### 🐛 Bug 5: `DeckService::getSeenJobIds()` Uses Raw Redis Facade

In [DeckService.php L159-161](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/DeckService.php#L157-L161):

```php
if (\Illuminate\Support\Facades\Redis::exists($redisKey)) {
    return \Illuminate\Support\Facades\Redis::smembers($redisKey);
}
```

This bypasses the injected `SwipeCacheRepository` and calls the Redis facade directly, breaking the repository abstraction. It also has a **TOCTOU race condition** — between `exists()` and `smembers()`, the key could expire. Use `smembers()` directly and check for an empty result.

---

### 🐛 Bug 6: `getPending()` Queries for Status `pending` Which Doesn't Exist

In [ApplicationRepository.php L97-103](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Repositories/PostgreSQL/ApplicationRepository.php#L97-L103):

```php
public function getPending(string $jobPostingId): Collection
{
    return Application::where('job_posting_id', $jobPostingId)
        ->where('status', 'pending')
        ...
}
```

The `applications.status` enum defined in the documentation and migration is `('applied', 'invited', 'dismissed')`. There is no `pending` status. This method will **always return an empty collection**.

---

## 5. Design Criticisms

### ⚠️ No UUID Generation in Most Models

Only the `User` model has UUID auto-generation in its `boot()` method. Other models like `ApplicantProfile`, `Application`, `JobPosting`, etc. have `$incrementing = false` and `$keyType = 'string'` but **no UUID generation logic**. They rely on the caller (or migration default) to provide IDs. If any code path forgets to set the ID, the insert will fail with a null PK error.

**Fix:** Either add the UUID boot trait to all models, or use Laravel's `HasUuids` trait.

---

### ⚠️ Inconsistent Response Format

The base controller provides `success()` and `error()` helpers, but the error response **doesn't include the `errors` field** for validation errors as specified in the documentation:

```json
// Documentation says:
{ "success": false, "message": "...", "errors": { "field": ["..."] }, "code": "..." }

// Actual error():
{ "success": false, "message": "...", "code": "..." }
```

Laravel's automatic validation exception handling would produce a different format entirely unless a custom exception handler maps it to this structure — and there's no custom exception handler visible.

---

### ⚠️ Notification Type Inconsistency

The documentation defines the notification type as `interview_invitation`, but [SendMatchNotification.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Jobs/SendMatchNotification.php) uses `match_found`. The terminology has drifted — the docs describe an asymmetric system (no mutual match), yet the code uses "match" language. This will cause confusion on the frontend.

---

### ⚠️ ProfileService Constructor is Overly Complex

[ProfileService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L17-L36) manually instantiates optional dependencies in the constructor instead of letting Laravel's container handle them. This makes testing harder and defeats the purpose of dependency injection:

```php
public function __construct(
    ...,
    ?ProfileCompletionService $completion = null,
    ?ProfileOnboardingService $onboarding = null,
) {
    $this->completion = $completion ?? new ProfileCompletionService;
    ...
}
```

---

### ⚠️ No Input Validation on Swipe Endpoints

The `SwipeController` doesn't validate that `$jobId` is a valid UUID before passing it to the service layer. An attacker could send garbage strings that would cause database lookup errors. Use Laravel Form Requests with UUID validation rules.

---

### ⚠️ Subscription Service is Company-Only

The entire [SubscriptionService](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php) is hardcoded for company/Basic tier subscriptions. The documentation specifies applicant subscriptions (Free/Basic/Pro) with different benefits. Currently, there's no way for applicants to subscribe.

---

## 6. Missing Features vs Documentation

Based on thorough analysis of the [documentation](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/mdfiles/documentation.md), [implementation roadmap](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/mdfiles/IMPLEMENTATION_ROADMAP.md), and [feature clarifications](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/mdfiles/FEATURE_CLARIFICATIONS.md):

### Implemented ✅

| Feature | Status | Quality |
|---|---|---|
| Email/password registration with OTP | ✅ | Good |
| Google OAuth (applicants only) | ✅ | Good |
| Login/logout + token management | ✅ | Good |
| Database schema (19 migrations) | ✅ | Complete |
| Applicant profile CRUD | ✅ | Good |
| Company profile CRUD | ✅ | Good |
| Profile onboarding flow | ✅ | Comprehensive |
| Profile completion tracking | ✅ | Good |
| Applicant swipe deck (with relevance scoring) | ✅ | Good |
| Applicant swipe right/left | ✅ | Has bugs (see above) |
| HR applicant review queue (with priority) | ✅ | Good |
| HR swipe right (invitation) / left (dismiss) | ✅ | Good |
| Swipe deduplication (Redis + MongoDB) | ✅ | Good |
| Daily swipe limit enforcement | ✅ | Works modulo field name bug |
| File upload via R2 pre-signed URLs | ✅ | Good |
| Company subscription checkout (Stripe) | ✅ | Excellent (idempotent) |
| Stripe webhook handling | ✅ | Good |
| Points system (award + recalculate) | ✅ | Good |
| In-app notification CRUD | ✅ | Good |
| Notification preferences (per user) | ✅ | Good |
| Job posting CRUD for companies | ✅ | Good |
| Job expiration (scheduled) | ✅ | Good |
| Daily swipe reset (scheduled) | ✅ | Good |
| Match notification (email + in-app) | ✅ | Partial (push is TODO) |
| User data cleanup on deletion | ✅ | Good |

### Missing ❌

| Feature | Documented? | Priority |
|---|---|---|
| **Forgot-password / reset-password** | ✅ Yes | 🔴 Critical |
| **Applicant subscription tiers** (Basic/Pro) | ✅ Yes | 🔴 Critical |
| **Swipe pack purchases** (5/10/15 extra swipes) | ✅ Yes | 🟡 High |
| **Apple IAP validation** | ✅ Yes | 🟡 High |
| **Google Play Billing validation** | ✅ Yes | 🟡 High |
| **Undo last swipe** (Pro only) | ✅ Yes | 🟡 High |
| **Company reviews system** | ✅ Yes (full spec) | 🟡 High |
| **Company verification workflow** (admin approval) | ✅ Yes | 🟡 High |
| **Admin panel endpoints** | ✅ Yes (full spec) | 🟡 High |
| **API rate limiting** | ✅ Yes (60/min auth, 20/min unauth) | 🔴 Critical |
| **Push notifications** (Expo integration) | ✅ Yes | 🟡 High |
| **Meilisearch integration** (active indexing/search) | ✅ Yes | 🟢 Medium |
| **HR swipes audit table** (`hr_swipes`) | ✅ Yes (in schema) | 🟢 Medium |
| **Applicant applications listing** endpoints | ✅ Yes | 🟢 Medium |
| **Email templates** (interview invitation, etc.) | ✅ Yes | 🟢 Medium |
| **Geo-radius job search** | ✅ Yes (v2) | 🔵 Low (v2) |
| **WebSocket** (Soketi) | ✅ Yes (v2) | 🔵 Low (v2) |
| **Test suite** | ✅ Yes (PHPUnit) | 🔴 Critical |

---

## 7. Recommendations & Priority Matrix

### Immediate Actions (Before Any Deployment)

| # | Action | Effort | Impact |
|---|---|---|---|
| 1 | **Delete or protect all debug endpoints** in `api.php` | 15 min | Eliminates critical info disclosure |
| 2 | **Implement API rate limiting** — use Laravel's built-in `ThrottleRequests` | 1–2 hours | Prevents brute-force and DDoS |
| 3 | **Fix `extra_swipe_balance` field name** across all files — choose one name | 30 min | Fixes broken swipe pack usage |
| 4 | **Replace `Redis::keys()` with `SCAN`** or remove the redundant cleanup | 30 min | Prevents Redis lockup in production |
| 5 | **Add UUID generation boot method** to all models, or use `HasUuids` trait | 1 hour | Prevents null PK crashes |

### Short-Term (Week 1–2)

| # | Action | Effort |
|---|---|---|
| 6 | Implement forgot-password / reset-password flow | 4 hours |
| 7 | Fix `getPending()` to use correct status value (`applied`) | 10 min |
| 8 | Standardize error response format to match documentation | 2 hours |
| 9 | Remove `EnsureRole` middleware (duplicate of `CheckRole`) | 15 min |
| 10 | Add Form Request validation to swipe and job endpoints | 3 hours |
| 11 | Write integration tests for auth, swipe, and subscription flows | 12 hours |

### Medium-Term (Week 3–6)

| # | Action | Effort |
|---|---|---|
| 12 | Implement applicant subscriptions (Basic/Pro tiers) | 8 hours |
| 13 | Implement swipe pack purchases | 6 hours |
| 14 | Build admin panel endpoints (verification, moderation) | 12 hours |
| 15 | Implement company reviews system | 8 hours |
| 16 | Integrate Expo push notifications (currently `// TODO`) | 6 hours |
| 17 | Build applicant applications listing endpoints | 3 hours |

---

> [!IMPORTANT]
> **The #1 priority before any production deployment is removing the debug endpoints and adding rate limiting.** The debug endpoints alone would be a failing finding in any security review. Everything else can be iterated on, but those two issues are non-negotiable blockers.

---

*End of analysis.*
