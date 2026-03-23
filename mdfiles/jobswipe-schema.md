# JobSwipe — Database Schema Reference
> **Version:** 1.1.0  
> **Last Updated:** 2026-03-18  
> **Scope:** PostgreSQL 16 · MongoDB 7 · Redis 7

---

## Table of Contents

1. [Responsibility Boundaries](#1-responsibility-boundaries)
2. [PostgreSQL Schema](#2-postgresql-schema)
3. [MongoDB Collections](#3-mongodb-collections)
4. [Redis Key Design](#4-redis-key-design)
5. [Cross-Store Reference Map](#5-cross-store-reference-map)

---

## 1. Responsibility Boundaries

| Store | Owns | Does NOT Own |
|---|---|---|
| **PostgreSQL** | Identity, auth, subscriptions, billing, applications, invitations, point ledger, reviews, notifications, job postings, company verification | Profile content, swipe history, document-shaped data |
| **MongoDB** | Applicant profiles, company profiles, swipe history (source of truth) | Transactional state, billing, anything requiring ACID joins |
| **Redis** | Swipe counter (hot), deck deduplication (warm cache), points cache, rate limiting, Horizon queues | Anything that cannot be reconstructed — MongoDB is always the fallback |

> **Key principle:** Redis holds no data that cannot be rebuilt from MongoDB or PostgreSQL. It is a performance layer, not a store.

---

## 2. PostgreSQL Schema

### 2.1 `users`

```sql
CREATE TABLE users (
    id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255)    NOT NULL,
    password_hash     VARCHAR(255)    NOT NULL,
    role              VARCHAR(20)     NOT NULL CHECK (role IN ('applicant', 'hr', 'company_admin', 'moderator', 'super_admin')),
    is_active         BOOLEAN         NOT NULL DEFAULT TRUE,
    is_banned         BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ     NULL,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email         ON users (email);
CREATE INDEX        idx_users_role          ON users (role);
CREATE INDEX        idx_users_is_banned     ON users (is_banned) WHERE is_banned = TRUE;
```

> `is_banned` uses a **partial index** — only indexes banned users, keeping it tiny since the vast majority are not banned.

---

### 2.2 `applicant_profiles`

```sql
CREATE TABLE applicant_profiles (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points          INTEGER     NOT NULL DEFAULT 0,
    subscription_tier     VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
    subscription_status   VARCHAR(15) NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    daily_swipes_used     INTEGER     NOT NULL DEFAULT 0,
    daily_swipe_limit     INTEGER     NOT NULL DEFAULT 15,
    extra_swipes_balance  INTEGER     NOT NULL DEFAULT 0,
    swipe_reset_at        DATE        NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_applicant_profiles_user_id
    ON applicant_profiles (user_id);

-- Composite index for the HR applicant queue ORDER BY (Section 8.1 of docs)
-- CASE on subscription_tier + total_points is evaluated against this
CREATE INDEX idx_applicant_profiles_queue
    ON applicant_profiles (subscription_tier, total_points DESC);

CREATE INDEX idx_applicant_profiles_subscription_status
    ON applicant_profiles (subscription_status) WHERE subscription_status = 'active';
```

> The `(subscription_tier, total_points DESC)` composite directly supports the 5-tier priority `CASE` query that powers the HR review queue without a sequential scan.

---

### 2.3 `company_profiles`

```sql
CREATE TABLE company_profiles (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name          VARCHAR(255) NOT NULL,
    is_verified           BOOLEAN     NOT NULL DEFAULT FALSE,
    verification_status   VARCHAR(15) NOT NULL DEFAULT 'unverified'
                            CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected')),
    subscription_tier     VARCHAR(10) NOT NULL DEFAULT 'none' CHECK (subscription_tier IN ('none', 'basic', 'pro')),
    subscription_status   VARCHAR(15) NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    active_listings_count INTEGER     NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_company_profiles_user_id
    ON company_profiles (user_id);

-- Admin verification queue
CREATE INDEX idx_company_profiles_verification_status
    ON company_profiles (verification_status) WHERE verification_status = 'pending';

CREATE INDEX idx_company_profiles_is_verified
    ON company_profiles (is_verified);
```

---

### 2.4 `job_postings`

```sql
CREATE TABLE job_postings (
    id                 UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id         UUID            NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    title              VARCHAR(255)    NOT NULL,
    description        TEXT            NOT NULL,
    salary_min         NUMERIC(12, 2)  NULL,
    salary_max         NUMERIC(12, 2)  NULL,
    salary_is_hidden   BOOLEAN         NOT NULL DEFAULT FALSE,
    work_type          VARCHAR(10)     NOT NULL CHECK (work_type IN ('remote', 'hybrid', 'on_site')),
    location           VARCHAR(255)    NULL,
    location_city      VARCHAR(100)    NULL,
    location_region    VARCHAR(100)    NULL,
    lat                NUMERIC(9, 6)   NULL,
    lng                NUMERIC(9, 6)   NULL,
    interview_template TEXT            NOT NULL,
    status             VARCHAR(10)     NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('active', 'closed', 'expired', 'draft')),
    expires_at         TIMESTAMPTZ     NULL,
    published_at       TIMESTAMPTZ     NULL,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

> `location_city`, `location_region`, `lat`, `lng` added to support structured location filtering via Meilisearch and future geo features — no PostGIS required.

**Indexes:**
```sql
CREATE INDEX idx_job_postings_company_id
    ON job_postings (company_id);

-- Primary deck query: only active, non-expired jobs
CREATE INDEX idx_job_postings_active
    ON job_postings (status, expires_at)
    WHERE status = 'active';

-- Recency sort within the active deck
CREATE INDEX idx_job_postings_published_at
    ON job_postings (published_at DESC)
    WHERE status = 'active';

-- Location-based filtering (city/region text match)
CREATE INDEX idx_job_postings_location_city    ON job_postings (location_city);
CREATE INDEX idx_job_postings_location_region  ON job_postings (location_region);
```

---

### 2.5 `job_skills`

```sql
CREATE TABLE job_skills (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_name     VARCHAR(100) NOT NULL,
    skill_type     VARCHAR(5)  NOT NULL CHECK (skill_type IN ('hard', 'soft'))
);
```

**Indexes:**
```sql
CREATE INDEX idx_job_skills_job_posting_id ON job_skills (job_posting_id);
CREATE INDEX idx_job_skills_skill_name     ON job_skills (skill_name);
```

---

### 2.6 `applications`

The transactional record created when an applicant swipes right. Also tracks invitation state when HR swipes right on that applicant.

```sql
CREATE TABLE applications (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id        UUID        NOT NULL REFERENCES applicant_profiles(id),
    job_posting_id      UUID        NOT NULL REFERENCES job_postings(id),
    status              VARCHAR(10) NOT NULL DEFAULT 'applied'
                            CHECK (status IN ('applied', 'invited', 'dismissed')),
    invitation_message  TEXT        NULL,
    invited_at          TIMESTAMPTZ NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
-- Deduplication: one application per applicant per posting
CREATE UNIQUE INDEX idx_applications_unique
    ON applications (applicant_id, job_posting_id);

-- HR pulls all applicants for a posting (most frequent query)
CREATE INDEX idx_applications_job_posting_id
    ON applications (job_posting_id);

-- HR queue: filter + sort by status within a posting
CREATE INDEX idx_applications_job_status
    ON applications (job_posting_id, status);

-- Applicant's own application history
CREATE INDEX idx_applications_applicant_id
    ON applications (applicant_id, created_at DESC);
```

---

### 2.7 `subscriptions`

```sql
CREATE TABLE subscriptions (
    id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID            NOT NULL REFERENCES users(id),
    subscriber_type       VARCHAR(10)     NOT NULL CHECK (subscriber_type IN ('applicant', 'company')),
    tier                  VARCHAR(10)     NOT NULL CHECK (tier IN ('basic', 'pro')),
    billing_cycle         VARCHAR(10)     NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount_paid           NUMERIC(10, 2)  NOT NULL,
    currency              VARCHAR(10)     NOT NULL DEFAULT 'PHP',
    payment_provider      VARCHAR(15)     NOT NULL CHECK (payment_provider IN ('stripe', 'apple_iap', 'google_play')),
    provider_sub_id       VARCHAR(255)    NULL,
    status                VARCHAR(10)     NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'expired')),
    current_period_start  TIMESTAMPTZ     NOT NULL,
    current_period_end    TIMESTAMPTZ     NOT NULL,
    created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_subscriptions_user_id
    ON subscriptions (user_id);

-- Expiry job: find subscriptions expiring soon
CREATE INDEX idx_subscriptions_expiry
    ON subscriptions (status, current_period_end)
    WHERE status = 'active';

CREATE INDEX idx_subscriptions_provider_sub_id
    ON subscriptions (provider_sub_id)
    WHERE provider_sub_id IS NOT NULL;
```

---

### 2.8 `swipe_packs`

```sql
CREATE TABLE swipe_packs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id        UUID            NOT NULL REFERENCES applicant_profiles(id),
    quantity            SMALLINT        NOT NULL CHECK (quantity IN (5, 10, 15)),
    amount_paid         NUMERIC(10, 2)  NOT NULL,
    payment_provider    VARCHAR(15)     NOT NULL CHECK (payment_provider IN ('stripe', 'apple_iap', 'google_play')),
    provider_payment_id VARCHAR(255)    NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_swipe_packs_applicant_id ON swipe_packs (applicant_id);
```

---

### 2.9 `point_events`

Append-only ledger. Points are never updated in place.

```sql
CREATE TABLE point_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID        NOT NULL REFERENCES applicant_profiles(id),
    event_type   VARCHAR(50) NOT NULL CHECK (event_type IN (
                    'resume_uploaded', 'bio_added', 'profile_photo_uploaded',
                    'linkedin_linked', 'social_linked', 'skills_added',
                    'cover_letter_uploaded', 'portfolio_uploaded',
                    'subscribed_basic', 'subscribed_pro', 'bonus_pro'
                 )),
    points       INTEGER     NOT NULL,
    description  VARCHAR(255) NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_point_events_applicant_id
    ON point_events (applicant_id, created_at DESC);

-- Prevent duplicate one-time events at the DB level
CREATE UNIQUE INDEX idx_point_events_onetime
    ON point_events (applicant_id, event_type)
    WHERE event_type NOT IN ('subscribed_basic', 'subscribed_pro', 'bonus_pro');
```

> The partial unique index enforces one-time point events without application-layer guards. Recurring events (`subscribed_*`, `bonus_pro`) are excluded and can repeat on each billing cycle.

---

### 2.10 `company_reviews`

```sql
CREATE TABLE company_reviews (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id   UUID        NOT NULL REFERENCES applicant_profiles(id),
    company_id     UUID        NOT NULL REFERENCES company_profiles(id),
    job_posting_id UUID        NOT NULL REFERENCES job_postings(id),
    rating         SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text    TEXT        NULL,
    is_flagged     BOOLEAN     NOT NULL DEFAULT FALSE,
    is_visible     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
-- One review per applicant per company
CREATE UNIQUE INDEX idx_company_reviews_unique
    ON company_reviews (applicant_id, company_id);

-- Fetch all visible reviews for a company (most frequent read)
CREATE INDEX idx_company_reviews_company_visible
    ON company_reviews (company_id, is_visible)
    WHERE is_visible = TRUE;

-- Moderation queue
CREATE INDEX idx_company_reviews_flagged
    ON company_reviews (is_flagged)
    WHERE is_flagged = TRUE;
```

---

### 2.11 `company_verifications`

```sql
CREATE TABLE company_verifications (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id       UUID        NOT NULL REFERENCES company_profiles(id),
    submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    documents        JSONB       NOT NULL DEFAULT '[]',
    reviewed_by      UUID        NULL REFERENCES users(id),
    reviewed_at      TIMESTAMPTZ NULL,
    status           VARCHAR(10) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT        NULL
);
```

**Indexes:**
```sql
CREATE INDEX idx_company_verifications_company_id
    ON company_verifications (company_id);

CREATE INDEX idx_company_verifications_pending
    ON company_verifications (status, submitted_at)
    WHERE status = 'pending';
```

---

### 2.12 `notifications`

```sql
CREATE TABLE notifications (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(100) NOT NULL,
    title      VARCHAR(255) NOT NULL,
    body       TEXT        NOT NULL,
    data       JSONB       NULL,
    read_at    TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
-- Unread notification count + list (most frequent query)
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, created_at DESC)
    WHERE read_at IS NULL;

-- Full notification history (includes read)
CREATE INDEX idx_notifications_user_all
    ON notifications (user_id, created_at DESC);
```

---

## 3. MongoDB Collections

### 3.1 `applicant_profiles`

```json
{
  "_id": "ObjectId",
  "user_id": "string (UUID from PostgreSQL)",
  "first_name": "string",
  "last_name": "string",
  "profile_photo_url": "string | null",
  "bio": "string | null",
  "location": "string | null",
  "location_city": "string | null",
  "location_region": "string | null",
  "linkedin_url": "string | null",
  "social_links": [
    { "platform": "string", "url": "string" }
  ],
  "resume_url": "string | null",
  "cover_letter_url": "string | null",
  "portfolio_url": "string | null",
  "skills": [
    { "name": "string", "type": "hard | soft" }
  ],
  "work_experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | null",
      "is_current": "boolean",
      "description": "string | null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduation_year": "number | null"
    }
  ],
  "completed_profile_fields": ["string"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes:**
```js
// Primary lookup by PostgreSQL UUID
db.applicant_profiles.createIndex(
  { user_id: 1 },
  { unique: true, name: "idx_applicant_profiles_user_id" }
)

// Meilisearch sync: find docs changed since last index run
db.applicant_profiles.createIndex(
  { updated_at: -1 },
  { name: "idx_applicant_profiles_updated_at" }
)

// Skill filtering (secondary to Meilisearch, useful for direct queries)
db.applicant_profiles.createIndex(
  { "skills.name": 1 },
  { name: "idx_applicant_profiles_skills" }
)
```

---

### 3.2 `company_profiles`

```json
{
  "_id": "ObjectId",
  "company_id": "string (UUID from PostgreSQL)",
  "company_name": "string",
  "tagline": "string | null",
  "description": "string | null",
  "industry": "string | null",
  "company_size": "string | null",
  "founded_year": "number | null",
  "website_url": "string | null",
  "logo_url": "string | null",
  "office_images": ["string (R2 URL)"],
  "social_links": [
    { "platform": "string", "url": "string" }
  ],
  "address": {
    "city": "string | null",
    "province": "string | null",
    "region": "string | null"
  },
  "benefits": ["string"],
  "culture_tags": ["string"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes:**
```js
db.company_profiles.createIndex(
  { company_id: 1 },
  { unique: true, name: "idx_company_profiles_company_id" }
)

db.company_profiles.createIndex(
  { updated_at: -1 },
  { name: "idx_company_profiles_updated_at" }
)
```

---

### 3.3 `swipe_history`

Source of truth for all swipe actions — both applicant and HR. Redis is the warm cache on top of this collection.

```json
{
  "_id": "ObjectId",
  "user_id": "string (UUID — the actor: applicant or HR user)",
  "actor_type": "applicant | hr",
  "direction": "left | right",
  "target_id": "string (UUID — job_posting_id OR applicant_profile_id)",
  "target_type": "job_posting | applicant",
  "job_posting_id": "string | null  (always set on HR swipes for context)",
  "swiped_at": "ISODate",
  "meta": {
    "subscription_tier": "free | basic | pro",
    "daily_swipe_count_at_time": "number"
  }
}
```

**Indexes:**
```js
// Primary deduplication guarantee — prevents double-swipe at the DB level
db.swipe_history.createIndex(
  { user_id: 1, target_id: 1, target_type: 1 },
  { unique: true, name: "idx_swipe_history_dedup" }
)

// Daily counter fallback when Redis is unavailable:
// db.swipe_history.countDocuments({ user_id, actor_type: "applicant", swiped_at: { $gte: startOfDay } })
db.swipe_history.createIndex(
  { user_id: 1, actor_type: 1, swiped_at: -1 },
  { name: "idx_swipe_history_daily_count" }
)

// "Which applicants swiped on this job?" — used to rebuild HR applicant pool
db.swipe_history.createIndex(
  { target_id: 1, target_type: 1, direction: 1 },
  { name: "idx_swipe_history_target" }
)

// Auto-expire swipe records after 180 days
// (Redis Sets carry a matching 90-day TTL — MongoDB window is wider for fallback coverage)
db.swipe_history.createIndex(
  { swiped_at: 1 },
  { expireAfterSeconds: 15552000, name: "idx_swipe_history_ttl" }
)
```

> The TTL index auto-deletes swipe records older than 180 days, preventing unbounded collection growth. The 180-day MongoDB window intentionally exceeds the 90-day Redis TTL so MongoDB can serve as a full fallback even after Redis has evicted its cached sets.

---

## 4. Redis Key Design

### 4.1 Swipe Counter

```
KEY     swipe:counter:{user_id}:{YYYY-MM-DD}
TYPE    String (integer)
TTL     Expires at midnight Philippine Time (UTC+8)
OPS     INCR  — on every swipe (left or right)
        SET   — on rehydration from MongoDB fallback
```

**Fallback (Redis miss or Redis DOWN):**
```js
const count = await db.swipe_history.countDocuments({
  user_id: userId,
  actor_type: "applicant",
  swiped_at: { $gte: startOfDayPHT }
})
await redis.set(`swipe:counter:${userId}:${today}`, count, { EXAT: midnightUnixPHT })
```

---

### 4.2 Deck Deduplication Cache (Applicant)

```
KEY     swipe:deck:seen:{user_id}
TYPE    Set  (job_posting UUIDs)
TTL     90 days
OPS     SADD      — on every swipe (left or right)
        SISMEMBER — on deck card load before serving
```

**Fallback (Redis miss or Redis DOWN):**
```js
const seen = await db.swipe_history
  .find({ user_id: userId, actor_type: "applicant" }, { projection: { target_id: 1 } })
  .toArray()
await redis.sadd(`swipe:deck:seen:${userId}`, ...seen.map(s => s.target_id))
await redis.expire(`swipe:deck:seen:${userId}`, 90 * 86400)
```

---

### 4.3 HR Applicant Deduplication Cache

```
KEY     swipe:hr:seen:{hr_user_id}:{job_posting_id}
TYPE    Set  (applicant_profile UUIDs)
TTL     90 days
OPS     SADD      — on every HR swipe
        SISMEMBER — before serving next applicant card
```

**Fallback:** same rebuild pattern from `swipe_history` filtered by `actor_type = "hr"` and `job_posting_id`.

---

### 4.4 HR Applicant Queue Cache

```
KEY     queue:applicants:{job_posting_id}
TYPE    Sorted Set
TTL     5 minutes  (invalidated on new application arriving)

SCORE FORMULA  (higher = shown first)
  Pro + points ≥ 100   →  500000 + (points × 10) − timestamp_offset
  Pro + points < 100   →  400000 + (points × 10) − timestamp_offset
  Non-sub + points ≥ 50 →  300000 + (points × 10) − timestamp_offset
  Non-sub + points 1–49 →  200000 + (points × 10) − timestamp_offset
  Non-sub + 0 points    →  100000 − timestamp_offset
```

`timestamp_offset` is a small value derived from `application.created_at` so earlier applicants rank higher within the same tier. On cache miss, computed fresh from PostgreSQL and written back.

---

### 4.5 Points Cache

```
KEY     points:{user_id}
TYPE    String (integer)
TTL     10 minutes
OPS     SET — after every point_events insertion
        GET — during queue score computation
```

**Fallback:** `SELECT total_points FROM applicant_profiles WHERE user_id = $1`

---

### 4.6 Rate Limiting

```
KEY     rate:api:ip:{ip_address}
TYPE    String (integer counter)
TTL     60 seconds
LIMIT   20 req/min (unauthenticated)

KEY     rate:api:user:{user_id}
TYPE    String (integer counter)
TTL     60 seconds
LIMIT   60 req/min (authenticated)
```

Rate limiting degrades gracefully during a Redis outage — burst traffic is allowed rather than blocking all requests. An alert from Sentry/Horizon signals the outage before abuse becomes a concern.

---

### 4.7 Session Cache

```
KEY     session:{token_hash}
TYPE    Hash
TTL     30 days (reset on activity)

FIELDS
  user_id       string
  role          string
  is_banned     bool
  tier          string
```

Avoids a PostgreSQL round-trip on every authenticated API request. On miss: re-validate token against `personal_access_tokens`, rebuild hash.

---

### 4.8 Horizon Queue Keys (Managed by Laravel)

```
KEY     queue:default          TYPE  List   (standard background jobs)
KEY     queue:notifications    TYPE  List   (high priority — invitations, push, email)
KEY     horizon:*              TYPE  Various (Horizon internal: metrics, worker heartbeat)
```

Owned and managed entirely by Laravel Horizon. Do not write to these manually.

---

## 5. Cross-Store Reference Map

### Applicant Swipe Right (Submit Application)

| Step | Store | Operation |
|---|---|---|
| 1. Check daily limit | Redis | `GET swipe:counter:{uid}:{date}` |
| 2. Counter fallback | MongoDB | `countDocuments swipe_history` by user + date |
| 3. Dedup check | Redis | `SISMEMBER swipe:deck:seen:{uid}` |
| 4. Dedup fallback | MongoDB | `find swipe_history` by user + target |
| 5. Write swipe record | MongoDB | `insertOne swipe_history` |
| 6. Write application | PostgreSQL | `INSERT INTO applications` |
| 7. Mark seen + increment | Redis | `SADD` + `INCR` |
| 8. Dispatch notification (HR) | Redis → Horizon | Push to `queue:notifications` |

### HR Swipe Right (Send Invitation)

| Step | Store | Operation |
|---|---|---|
| 1. Dedup check | Redis | `SISMEMBER swipe:hr:seen:{hr_id}:{job_id}` |
| 2. Dedup fallback | MongoDB | `find swipe_history` by hr user + applicant + job |
| 3. Write swipe record | MongoDB | `insertOne swipe_history` |
| 4. Update application status | PostgreSQL | `UPDATE applications SET status = 'invited'` |
| 5. Mark seen | Redis | `SADD swipe:hr:seen:{hr_id}:{job_id}` |
| 6. Dispatch invitation | Redis → Horizon | Push + email via `queue:notifications` |

### Redis Failure Fallback Summary

| Lost Redis Key | Fallback Source | Recovery Action |
|---|---|---|
| `swipe:counter:{uid}:{date}` | MongoDB `swipe_history` count | `countDocuments` → `SET` on recovery |
| `swipe:deck:seen:{uid}` | MongoDB `swipe_history` | Rebuild Set → `EXPIRE` on recovery |
| `swipe:hr:seen:{hr_id}:{job_id}` | MongoDB `swipe_history` | Rebuild Set → `EXPIRE` on recovery |
| `queue:applicants:{job_id}` | PostgreSQL `CASE` query | Recompute → repopulate Sorted Set |
| `points:{user_id}` | PostgreSQL `applicant_profiles` | `SELECT total_points` → `SET` on recovery |
| `rate:api:*` | None needed | Degrades gracefully, burst allowed |
| `session:{token_hash}` | PostgreSQL `personal_access_tokens` | Re-validate token, rebuild Hash |
| Horizon queue jobs | None — in-flight jobs lost | `failed_jobs` table + Sentry alert for manual replay |

> The only unrecoverable failure in a Redis outage is **in-flight Horizon queue jobs**. All swipe data and application state are fully reconstructable from MongoDB and PostgreSQL.

---

*End of JobSwipe Schema Reference v1.1.0*
