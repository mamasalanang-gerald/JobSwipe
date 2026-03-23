# JobSwipe — Product & Technical Documentation

> **Version:** 1.0.0 (v1)
> **Market:** Philippines
> **Last Updated:** 2026-03-17

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Infrastructure & Deployment](#3-infrastructure--deployment)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [Feature Specifications](#6-feature-specifications)
7. [Subscription & Points System](#7-subscription--points-system)
8. [Queue & Prioritization Algorithm](#8-queue--prioritization-algorithm)
9. [Notification System](#9-notification-system)
10. [File Storage Strategy](#10-file-storage-strategy)
11. [API Structure](#11-api-structure)
12. [Admin Panel](#12-admin-panel)
13. [Security & Compliance](#13-security--compliance)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Environment Variables Reference](#15-environment-variables-reference)

---

## 1. Project Overview

### 1.1 Concept

JobSwipe is a mobile-first job matching platform that borrows the swipe mechanic from social discovery apps (Tinder/Bumble) and applies it to the hiring process. It targets the Philippine job market with a dual-sided marketplace: **Applicants** discover and apply to jobs by swiping, while **HR/Companies** review and shortlist applicants by swiping through their profiles.

### 1.2 Core Matching Mechanic — Asymmetric (Model B)

The matching flow is **not mutual**. The two sides operate independently:

| Action | Actor | Result |
|---|---|---|
| Swipe Right on a Job Posting | Applicant | Application submitted |
| Swipe Left on a Job Posting | Applicant | Job dismissed |
| Swipe Right on an Applicant Profile | HR | Interview invitation dispatched |
| Swipe Left on an Applicant Profile | HR | Applicant dismissed for that posting |

There is **no mutual match requirement**. An applicant swiping right is an application. HR swiping right is an interview invitation. These are two independent flows with no dependency on each other.

### 1.3 Key Principles

- No in-app real-time chat in v1. Communication is one-way (notification + email dispatch).
- Applicants are proactive: they see all active job postings and decide to apply.
- HR is reactive: they review the pool of applicants who applied to their specific job posting.
- Prioritization is points + subscription driven, not purely algorithmic black-box.

---

## 2. Tech Stack

### 2.1 Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Web App | **Next.js 14** (App Router) | Marketing site, web dashboard, HR panel |
| Mobile App | **React Native + Expo SDK 51** | iOS & Android applicant and HR apps |
| Shared UI Logic | React + TypeScript | Shared component logic where applicable |
| Styling (Web) | Tailwind CSS | Utility-first, responsive styling |
| Styling (Mobile) | NativeWind | Tailwind-compatible for React Native |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Data Fetching | TanStack Query (React Query) | Server state, caching, pagination |
| Forms | React Hook Form + Zod | Validation on both platforms |
| Animations (Mobile) | React Native Reanimated + Gesture Handler | Swipe card animations |
| Push Notifications (Mobile) | Expo Notifications + Expo Push Service | iOS/Android push delivery |

### 2.2 Backend

| Layer | Technology | Purpose |
|---|---|---|
| API Framework | **PHP Laravel 11** | REST API, business logic, queue workers |
| Authentication | Laravel Sanctum | Token-based auth for SPA and mobile |
| Queue System | Laravel Horizon + Redis | Background jobs (notifications, point recalc, email) |
| Search | **Meilisearch** (via Laravel Scout) | Full-text job and applicant discovery/filtering |
| WebSocket (future) | Soketi (self-hosted) | Reserved for v2 real-time features |
| Email | **Resend** (via Laravel Mail) | Transactional emails (invitations, receipts) |

### 2.3 Databases

| Database | Use Case | Why |
|---|---|---|
| **PostgreSQL 16** | Subscriptions, billing, swipe records, points, job postings, applications, users (identity), reviews | ACID compliance, relational integrity, transactional safety |
| **MongoDB** | User profile documents (applicant profiles, company profiles), skill tags, dynamic profile fields | Flexible schema for evolving profile structures |
| **Redis 7** | Swipe rate limiting, swipe history (deduplication), session cache, queue backend for Horizon, real-time counters | Speed, ephemeral data, queue management |

### 2.4 Payments

| Platform | Provider | Notes |
|---|---|---|
| Web | **Stripe** | Subscriptions, one-time swipe pack purchases. Supports PHP (Philippine Peso). Managed via Laravel Cashier. |
| iOS | **Apple In-App Purchase (StoreKit 2)** | Swipe packs, Pro subscriptions on iOS |
| Android | **Google Play Billing** | Swipe packs, Pro subscriptions on Android |

> **Important:** Apple and Google take 15–30% commission on IAP purchases. Pricing for mobile swipe packs and subscriptions must account for this margin. Web Stripe purchases bypass this fee.

### 2.5 Infrastructure & Services

| Service | Provider | Purpose |
|---|---|---|
| Web Deployment | **Vercel** | Next.js hosting, edge functions, preview deployments, ISR |
| Mobile Build & OTA | **Expo EAS** | App store submissions, OTA updates, build pipelines |
| API & Services | **AWS EC2** (or DigitalOcean Droplet) | Docker-hosted Laravel, PostgreSQL, MongoDB, Redis, Meilisearch |
| File Storage | **Cloudflare R2** | Resumes, cover letters, portfolios, company images, profile photos |
| CDN + WAF | **Cloudflare** | DDoS protection, edge caching, SSL termination for the web app |
| Error Monitoring | **Sentry** | Frontend (Next.js + Expo) and backend (Laravel) error tracking |
| Container Orchestration | **Docker + Docker Compose** | Local dev parity and production service management |
| CI/CD | **GitHub Actions** | Automated testing, linting, and deployment pipelines |

---

## 3. Infrastructure & Deployment

### 3.1 Architecture Topology

```
                          ┌─────────────────────────────────────────┐
                          │              Cloudflare CDN/WAF          │
                          └────────────────────┬────────────────────┘
                                               │
              ┌────────────────────────────────┼────────────────────────────────┐
              │                                │                                │
     ┌────────▼────────┐             ┌─────────▼────────┐            ┌─────────▼────────┐
     │   Vercel Edge   │             │   AWS EC2 / VPS  │            │  Cloudflare R2   │
     │  (Next.js Web)  │             │  (Docker Host)   │            │  (File Storage)  │
     └─────────────────┘             └─────────┬────────┘            └──────────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                   ┌──────────▼────┐  ┌────────▼───────┐  ┌────▼──────────────┐
                   │ Laravel API   │  │  PostgreSQL 16  │  │  MongoDB           │
                   │ (php-fpm +    │  │  (Transactions) │  │  (Profiles)        │
                   │  nginx)       │  └────────────────┘  └───────────────────┘
                   └──────────┬────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
    ┌──────────▼───┐  ┌───────▼────┐  ┌──────▼──────────┐
    │    Redis 7   │  │ Meilisearch│  │ Laravel Horizon  │
    │  (Cache/Queue│  │  (Search)  │  │ (Queue Workers)  │
    └──────────────┘  └────────────┘  └─────────────────┘
```

### 3.2 Docker Compose Services (Production)

```yaml
services:
  nginx:          # Reverse proxy for Laravel
  php-fpm:        # Laravel application
  postgres:       # PostgreSQL 16
  mongo:          # MongoDB 7
  redis:          # Redis 7
  meilisearch:    # Meilisearch
  horizon:        # Laravel Horizon queue worker
  scheduler:      # Laravel task scheduler (cron)
```

### 3.3 Vercel Configuration

- **Framework:** Next.js (App Router)
- **Environment:** Production branch `main`, staging branch `staging`
- **Edge Functions:** Used for geolocation-based job filtering (future), middleware auth checks
- **ISR:** Job listing pages are statically regenerated every 60 seconds

### 3.4 Expo EAS Configuration

- **Build profiles:** `development`, `preview`, `production`
- **OTA Updates:** Enabled for non-native changes (JS bundle updates bypass app store review)
- **Channels:** `production`, `staging`

---

## 4. System Architecture

### 4.1 Authentication Flow

1. User registers via email + password (or social OAuth in v2).
2. On login, Laravel Sanctum issues a **personal access token**.
3. Token is stored securely:
   - Web (Next.js): `httpOnly` cookie via Sanctum SPA cookie authentication.
   - Mobile (Expo): `expo-secure-store`.
4. All API requests send `Authorization: Bearer <token>` header (mobile) or rely on cookie (web).
5. Token expiry: 30 days. Refresh on activity.

### 4.2 Role System

| Role | Description |
|---|---|
| `applicant` | Job seeker, can swipe jobs, manage profile |
| `hr` | Company user, can create postings, swipe applicants |
| `company_admin` | Manages the company account, billing, HR user seats |
| `moderator` | Admin panel: reviews, content moderation |
| `super_admin` | Full admin panel access |

### 4.3 Request Lifecycle (Mobile API Call)

```
Expo App → HTTPS → Cloudflare WAF → EC2 Nginx → php-fpm (Laravel)
        → Sanctum Auth Middleware
        → Route Controller
        → Service Layer (business logic)
        → Repository Layer (DB queries)
        → PostgreSQL / MongoDB / Redis
        → JSON Response
```

### 4.4 Background Job Lifecycle

```
Controller dispatches Job to Redis Queue
→ Laravel Horizon picks up Job
→ Executes: notification dispatch / email / point recalculation / swipe deduplication
→ On failure: retried up to 3 times with exponential backoff
→ On final failure: logged to failed_jobs table + Sentry alert
```

---

## 5. Database Design

### 5.1 PostgreSQL — Schema Overview

> Source of truth for all transactional, relational, and algorithmic data.

#### `users`
```sql
id                  UUID PRIMARY KEY
email               VARCHAR(255) UNIQUE NOT NULL
password_hash       VARCHAR(255) NOT NULL
role                ENUM('applicant', 'hr', 'company_admin', 'moderator', 'super_admin')
is_active           BOOLEAN DEFAULT TRUE
is_banned           BOOLEAN DEFAULT FALSE
email_verified_at   TIMESTAMP NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `applicant_profiles`
```sql
id                  UUID PRIMARY KEY
user_id             UUID FK → users.id
total_points        INTEGER DEFAULT 0
subscription_tier   ENUM('free', 'basic', 'pro') DEFAULT 'free'
subscription_status ENUM('active', 'inactive', 'cancelled') DEFAULT 'inactive'
daily_swipes_used   INTEGER DEFAULT 0
daily_swipe_limit   INTEGER DEFAULT 15  -- updated based on subscription
extra_swipes_balance INTEGER DEFAULT 0
swipe_reset_at      DATE  -- date of last swipe reset
mongo_profile_id    VARCHAR(255)  -- reference to MongoDB document
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `company_profiles`
```sql
id                  UUID PRIMARY KEY
user_id             UUID FK → users.id
company_name        VARCHAR(255) NOT NULL
is_verified         BOOLEAN DEFAULT FALSE
verification_status ENUM('unverified', 'pending', 'approved', 'rejected') DEFAULT 'unverified'
subscription_tier   ENUM('none', 'basic', 'pro') DEFAULT 'none'
subscription_status ENUM('active', 'inactive', 'cancelled') DEFAULT 'inactive'
active_listings_count INTEGER DEFAULT 0
mongo_profile_id    VARCHAR(255)  -- reference to MongoDB document
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `job_postings`
```sql
id                  UUID PRIMARY KEY
company_id          UUID FK → company_profiles.id
title               VARCHAR(255) NOT NULL
description         TEXT NOT NULL
salary_min          DECIMAL(12,2) NULL
salary_max          DECIMAL(12,2) NULL
salary_is_hidden    BOOLEAN DEFAULT FALSE
work_type           ENUM('remote', 'hybrid', 'on_site')
location            VARCHAR(255) NULL
interview_template  TEXT NOT NULL  -- REQUIRED: default message sent on HR right swipe
status              ENUM('active', 'closed', 'expired', 'draft') DEFAULT 'draft'
expires_at          TIMESTAMP NULL  -- auto-expire (default 60 days from publish)
published_at        TIMESTAMP NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `job_skills` (join table)
```sql
id              UUID PRIMARY KEY
job_posting_id  UUID FK → job_postings.id
skill_name      VARCHAR(100) NOT NULL
skill_type      ENUM('hard', 'soft')
```

#### `applications`
```sql
id                  UUID PRIMARY KEY
applicant_id        UUID FK → applicant_profiles.id
job_posting_id      UUID FK → job_postings.id
status              ENUM('applied', 'invited', 'dismissed') DEFAULT 'applied'
invitation_message  TEXT NULL  -- the message sent when HR swipes right
invited_at          TIMESTAMP NULL
created_at          TIMESTAMP  -- this is when applicant swiped right
UNIQUE(applicant_id, job_posting_id)
```

#### `hr_swipes` (audit log of HR swipe actions)
```sql
id              UUID PRIMARY KEY
hr_user_id      UUID FK → users.id
applicant_id    UUID FK → applicant_profiles.id
job_posting_id  UUID FK → job_postings.id
direction       ENUM('left', 'right')
created_at      TIMESTAMP
UNIQUE(hr_user_id, applicant_id, job_posting_id)
```

#### `subscriptions`
```sql
id                  UUID PRIMARY KEY
user_id             UUID FK → users.id
subscriber_type     ENUM('applicant', 'company')
tier                ENUM('basic', 'pro')
billing_cycle       ENUM('monthly', 'yearly')
amount_paid         DECIMAL(10,2)
currency            VARCHAR(10) DEFAULT 'PHP'
payment_provider    ENUM('stripe', 'apple_iap', 'google_play')
provider_sub_id     VARCHAR(255) NULL  -- Stripe subscription ID or IAP receipt
status              ENUM('active', 'cancelled', 'past_due', 'expired')
current_period_start TIMESTAMP
current_period_end   TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `swipe_packs` (one-time purchases)
```sql
id                  UUID PRIMARY KEY
applicant_id        UUID FK → applicant_profiles.id
quantity            INTEGER  -- 5, 10, or 15
amount_paid         DECIMAL(10,2)
payment_provider    ENUM('stripe', 'apple_iap', 'google_play')
provider_payment_id VARCHAR(255) NULL
created_at          TIMESTAMP
```

#### `point_events`
```sql
id              UUID PRIMARY KEY
applicant_id    UUID FK → applicant_profiles.id
event_type      ENUM('linkedin_linked', 'resume_uploaded', 'social_linked', 'bio_added',
                     'skills_added', 'cover_letter_uploaded', 'portfolio_uploaded',
                     'subscribed_basic', 'subscribed_pro', 'bonus_pro')
points          INTEGER NOT NULL
description     VARCHAR(255) NULL
created_at      TIMESTAMP
```

#### `company_reviews`
```sql
id              UUID PRIMARY KEY
applicant_id    UUID FK → applicant_profiles.id
company_id      UUID FK → company_profiles.id
job_posting_id  UUID FK → job_postings.id  -- must have applied to this posting
rating          SMALLINT CHECK (rating BETWEEN 1 AND 5)
review_text     TEXT NULL
is_flagged      BOOLEAN DEFAULT FALSE
is_visible      BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP
updated_at      TIMESTAMP
UNIQUE(applicant_id, company_id)  -- one review per applicant per company
```

#### `company_verifications`
```sql
id                  UUID PRIMARY KEY
company_id          UUID FK → company_profiles.id
submitted_at        TIMESTAMP
documents           JSONB  -- array of R2 file paths
reviewed_by         UUID FK → users.id NULL
reviewed_at         TIMESTAMP NULL
status              ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
rejection_reason    TEXT NULL
```

#### `notifications`
```sql
id              UUID PRIMARY KEY
user_id         UUID FK → users.id
type            VARCHAR(100)  -- e.g. 'interview_invitation', 'swipe_limit_reset'
title           VARCHAR(255)
body            TEXT
data            JSONB NULL  -- any extra payload (job_id, etc.)
read_at         TIMESTAMP NULL
created_at      TIMESTAMP
```

---

### 5.2 MongoDB — Collections

> Used for flexible, document-shaped profile data that does not drive transactional logic.

#### `applicant_profiles`
```json
{
  "_id": "ObjectId",
  "user_id": "uuid-from-postgres",
  "first_name": "string",
  "last_name": "string",
  "profile_photo_url": "string (R2 URL)",
  "bio": "string",
  "location": "string",
  "linkedin_url": "string | null",
  "social_links": [{ "platform": "string", "url": "string" }],
  "resume_url": "string (R2 URL)",
  "cover_letter_url": "string | null (R2 URL)",
  "portfolio_url": "string | null (R2 URL)",
  "skills": [{ "name": "string", "type": "hard|soft" }],
  "work_experience": [
    {
      "company": "string",
      "position": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | null",
      "is_current": "boolean",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduation_year": "number"
    }
  ],
  "completed_profile_fields": ["bio", "linkedin", "resume"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

#### `company_profiles`
```json
{
  "_id": "ObjectId",
  "company_id": "uuid-from-postgres",
  "company_name": "string",
  "tagline": "string",
  "description": "string",
  "industry": "string",
  "company_size": "string (e.g. '50-100')",
  "founded_year": "number",
  "website_url": "string",
  "logo_url": "string (R2 URL)",
  "office_images": ["string (R2 URL)"],
  "social_links": [{ "platform": "string", "url": "string" }],
  "address": {
    "city": "string",
    "province": "string",
    "region": "string"
  },
  "benefits": ["string"],
  "culture_tags": ["string"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

---

### 5.3 Redis — Key Design

| Key Pattern | Type | TTL | Purpose |
|---|---|---|---|
| `swipe:user:{user_id}:date:{YYYY-MM-DD}` | String (counter) | Until EOD | Daily swipe count tracking |
| `swipe:seen:{user_id}:jobs` | Set | 90 days | Job IDs already seen by applicant (deduplication) |
| `swipe:seen:hr:{hr_id}:job:{job_id}` | Set | 90 days | Applicant IDs already swiped by HR for a posting |
| `session:{token_hash}` | Hash | 30 days | API session cache |
| `queue:default` | List | — | Laravel Horizon default queue |
| `queue:notifications` | List | — | High-priority notification queue |
| `points:applicant:{user_id}` | String | 10 min | Cached total points (recalculated on event) |
| `rate:api:{ip}` | String (counter) | 1 min | API rate limiting per IP |

---

## 6. Feature Specifications

### 6.1 Onboarding

#### Applicant Onboarding (Required Steps)
1. Email registration + email verification
2. Basic profile info (name, location)
3. **Resume upload** — mandatory, blocks progression if skipped
4. Skills input (at least 1)
5. Profile photo upload (optional but prompted)
6. Optional: LinkedIn link, cover letter, portfolio, bio
7. Points are immediately awarded for completed steps

#### Company Onboarding
1. Company admin registers with business email
2. Company profile setup (name, description, industry, logo, office images)
3. Choose subscription tier (Basic or Pro)
4. If Basic: submit verification documents (BIR registration, DTI/SEC, valid ID)
5. Await admin approval for verified badge (Basic and Pro)
6. Once approved: can create job postings

---

### 6.2 Job Posting Creation (HR)

A job posting is created through a multi-step form with the following fields:

**Step 1 — Position Details**
- Job title (required)
- Job description (required, rich text)
- Work type: Remote / Hybrid / On-site (required)
- Location (required if Hybrid or On-site)
- Salary range (optional, can be marked as "Confidential")
- Job expiry duration (30 / 60 / 90 days, default 60)

**Step 2 — Skills**
- Hard skills required (searchable tag input, powered by Meilisearch)
- Soft skills required (same)

**Step 3 — Company Presentation**
- Select from uploaded company/office images to feature in this job card (min 1, max 6)
- These images appear when applicants swipe through the job posting card

**Step 4 — Interview Message Template (Required)**
- HR must write a default interview invitation message
- This message is auto-dispatched to applicants when HR swipes right on them
- HR can edit this message at the moment of swiping (optional override)
- Character limit: 1,000 characters
- A set of editable shortcodes is available: `{{applicant_name}}`, `{{job_title}}`, `{{company_name}}`

**Step 5 — Review & Publish**
- Preview the job card as applicants will see it
- Publish immediately or save as draft
- Active listing limit enforced (Basic: 5, Pro: unlimited)

---

### 6.3 Applicant Swipe Flow

1. Applicant opens the app → swipe deck loads (all active job postings)
2. Deck is **not** randomized. It is ordered by relevance (see Section 8 for queue algorithm).
3. Each card displays:
   - Company name + verified badge (if applicable)
   - Job title
   - Work type + location
   - Salary (or "Confidential")
   - Office/company images (swipeable gallery within the card)
   - Skills required (hard + soft tags)
4. Applicant can tap the card to expand full job description
5. **Swipe Right** → Application submitted (record created in `applications` table, entry added to HR's applicant pool for that posting)
6. **Swipe Left** → Job dismissed (recorded in Redis swipe history for deduplication)
7. Daily swipe limit enforced via Redis counter. On limit reached: prompt to buy extra swipes or upgrade.
8. Already-swiped job postings (either direction) are excluded from future deck loads (Redis Set deduplication).

---

### 6.4 HR Applicant Review Flow

1. HR navigates to a specific job posting dashboard
2. They enter the "Review Applicants" swipe interface
3. Each applicant card shows:
   - Profile photo + name
   - Current job title / most recent experience
   - Skills (matched against job requirements — matched skills highlighted)
   - Education summary
   - Total points (displayed as a tier indicator, not raw number)
   - Resume download link
4. HR can tap the card for full applicant profile view
5. **Swipe Right** → Interview invitation triggered:
   - Modal appears with the pre-written interview template message
   - HR can edit the message before sending or confirm as-is
   - On confirm: `applications.status` updated to `invited`, notification + email dispatched to applicant
6. **Swipe Left** → Applicant dismissed for this posting. `hr_swipes` record created. Applicant remains unaware.
7. HR cannot re-swipe an applicant for the same posting (Redis deduplication).

---

### 6.5 Applicant Receives Invitation

- Push notification: "You've been invited to interview at {{company_name}} for {{job_title}}!"
- Email dispatch via Resend: Contains the HR's message, company name, and a link to the job posting.
- In-app notification stored in the `notifications` table.
- **No reply mechanism in v1.** Applicant acknowledges and contacts the company via the provided contact info or email.
- `applications.status` reflects `invited` state, visible in the applicant's "My Applications" screen.

---

### 6.6 Company Reviews

- Any applicant who has an `applications` record (status: `applied`, `invited`) for a company can leave a review.
- One review per applicant per company.
- Review contains: 1–5 star rating + optional text.
- **Access control:**
  - **Free applicants:** Can see average rating and total review count only.
  - **Pro applicants:** Can read all individual reviews in full (analytics access).
- Reviews can be flagged by other users for moderation.
- Flagged reviews enter the moderation queue in the admin panel.

---

### 6.7 Swipe Pack Purchases (Applicants)

Available pack sizes: **5, 10, or 15 swipes**

- Web: Stripe one-time payment checkout.
- Mobile: Apple IAP / Google Play Billing.
- On successful payment: `extra_swipes_balance` incremented in `applicant_profiles`.
- Extra swipes are consumed only after the daily free/subscribed limit is exhausted.
- Extra swipes do **not** expire.

---

## 7. Subscription & Points System

### 7.1 Company Subscription Tiers

| Feature | Basic (₱150/mo) | Pro (Monthly) | Pro (Yearly) |
|---|---|---|---|
| Verified company badge | ✅ | ✅ | ✅ |
| Active job listings | 5 max | Unlimited | Unlimited |
| Applicant sorting & filtering | ❌ | ✅ | ✅ |
| Applicant analytics (bulk view) | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| Document verification required | ✅ | ✅ | ✅ |

> **Note:** Pro pricing to be defined. Suggested range: ₱500–₱1,200/month, ₱5,000–₱12,000/year.
> Basic tier requires admin document approval before the badge is granted, even though it is paid.

---

### 7.2 Applicant Subscription Tiers

| Feature | Free | Basic | Pro (Monthly/Yearly) |
|---|---|---|---|
| Daily swipes | 10–15 | 15 | Unlimited |
| Buy extra swipes | ✅ | ✅ | N/A (unlimited) |
| Company review access | Summary only | Summary only | Full reviews |
| Profile boost (queue priority) | ❌ | ❌ | ✅ |
| Bonus points on subscribe | ❌ | ✅ | ✅ (higher) |
| Undo last swipe | ❌ | ❌ | ✅ |

> **Note:** Applicant pricing to be defined. Suggested: Basic ₱99/mo, Pro ₱199/mo or ₱1,999/year.

---

### 7.3 Points System

Points are stored in `applicant_profiles.total_points` and logged in `point_events`.

| Event | Points Awarded | One-time / Repeatable |
|---|---|---|
| Resume uploaded | +30 | One-time |
| Bio added | +10 | One-time |
| Profile photo uploaded | +10 | One-time |
| LinkedIn account linked | +20 | One-time |
| Social media linked (per platform, max 3) | +5 each | One-time per platform |
| Skills added (minimum 3) | +15 | One-time |
| Cover letter uploaded | +15 | One-time |
| Portfolio linked/uploaded | +20 | One-time |
| Subscribed to Applicant Basic | +25 | On each billing renewal |
| Subscribed to Applicant Pro | +50 | On each billing renewal |
| Pro subscriber bonus (monthly) | +10 | Monthly recurring |

> **Maximum possible points (excluding recurring):** ~140 base profile completion points.
> Points are recalculated and cached in Redis on every `point_events` insertion.
> Points are **never deducted**, only accumulated (with the exception of account suspension, which freezes the queue position).

---

## 8. Queue & Prioritization Algorithm

### 8.1 HR's Applicant Queue (Per Job Posting)

When HR opens the applicant review interface for a job posting, applicants who have swiped right on that job are shown in the following priority order:

```
Priority 1: Pro subscriber + points ≥ 100
Priority 2: Pro subscriber + points < 100
Priority 3: Non-subscriber + points ≥ 50
Priority 4: Non-subscriber + points 1–49
Priority 5: Non-subscriber + 0 points
```

Within each priority tier, applicants are sorted by **application timestamp** (earliest first). This prevents stale applications from being buried indefinitely.

This ordering is computed at query time via PostgreSQL with a `CASE` statement on `subscription_tier` and `total_points`, not stored as a field. It can be cached in Redis per job posting (5-minute TTL, invalidated on new application).

### 8.2 Applicant's Job Swipe Deck

The deck shown to an applicant is constructed as follows:

1. **Filter:** Only `status = 'active'` job postings, not yet expired, not already swiped by this applicant (Redis Set exclusion).
2. **Relevance sort:** Jobs whose `job_skills` overlap with the applicant's skills in MongoDB are ranked higher (computed via Meilisearch skill matching score).
3. **Recency:** More recently published jobs surface higher within the same skill relevance tier.
4. **Exclusion:** Jobs from companies whose postings the applicant has already applied to in the last 30 days are deprioritized (not hidden, just pushed lower).
5. Deck is paginated: 20 cards loaded at a time, next batch fetched on approaching end of deck.

---

## 9. Notification System

### 9.1 Notification Types

| Type | Trigger | Channel |
|---|---|---|
| `interview_invitation` | HR swipes right on applicant | Push + Email |
| `swipe_limit_reached` | Applicant hits daily swipe limit | Push + In-app |
| `swipe_reset` | Daily swipe counter reset | Push (optional, user-configurable) |
| `application_received` | Applicant swipes right on HR's job | In-app (HR side) |
| `subscription_renewed` | Billing cycle renewal | Email |
| `subscription_expiring` | 3 days before expiry | Push + Email |
| `verification_approved` | Admin approves company | Push + Email |
| `verification_rejected` | Admin rejects company | Push + Email |
| `review_flagged` | Moderator flags a review | In-app (company) |

### 9.2 Delivery Stack

- **Push (Mobile):** Expo Push Notification Service → APNs (iOS) / FCM (Android)
- **Email:** Resend (via Laravel Mail driver). Transactional templates managed in Resend dashboard.
- **In-app:** Stored in `notifications` PostgreSQL table. Polled on app foreground.

### 9.3 Queue Priority

Notifications dispatched via Laravel Horizon on the `notifications` queue (high priority). Failed notifications retry up to 3 times with exponential backoff.

---

## 10. File Storage Strategy

All user-uploaded files are stored in **Cloudflare R2**. R2 is S3-compatible, has no egress fees, and is served through Cloudflare's CDN for fast delivery across the Philippines.

### 10.1 Bucket Structure

```
r2://jobswipe-assets/
├── applicants/
│   ├── {user_id}/
│   │   ├── profile_photo.jpg
│   │   ├── resume.pdf
│   │   ├── cover_letter.pdf
│   │   └── portfolio/
│   │       └── {filename}
├── companies/
│   ├── {company_id}/
│   │   ├── logo.png
│   │   ├── office_images/
│   │   │   └── {image_id}.jpg
│   │   └── verification_docs/
│   │       └── {doc_id}.pdf
```

### 10.2 Upload Flow

1. Client requests a **pre-signed upload URL** from Laravel API.
2. Laravel generates the URL using the Cloudflare R2 SDK (S3-compatible).
3. Client uploads the file **directly to R2** (no file passing through the API server).
4. Client sends the confirmed R2 key back to the API to update the profile record.
5. R2 public access is configured per folder: `office_images` and `profile_photo` are public. `resume`, `cover_letter`, `verification_docs` require signed access.

### 10.3 File Constraints

| File Type | Max Size | Accepted Formats |
|---|---|---|
| Profile photo | 5 MB | JPG, PNG, WEBP |
| Resume | 10 MB | PDF |
| Cover letter | 5 MB | PDF |
| Portfolio | 20 MB | PDF, ZIP |
| Company logo | 5 MB | JPG, PNG, WEBP, SVG |
| Office images | 10 MB each | JPG, PNG, WEBP |
| Verification docs | 10 MB each | PDF, JPG, PNG |

---

## 11. API Structure

### 11.1 Base URL

```
Production: https://api.jobswipe.ph/v1
Staging:    https://api-staging.jobswipe.ph/v1
```

### 11.2 Authentication Headers

```
Authorization: Bearer {sanctum_token}
Accept: application/json
Content-Type: application/json
```

### 11.3 Endpoint Overview

#### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/verify-email
POST   /auth/resend-verification
POST   /auth/forgot-password
POST   /auth/reset-password
```

#### Applicant Profile
```
GET    /applicant/profile
PUT    /applicant/profile
POST   /applicant/profile/photo          -- returns pre-signed R2 URL
POST   /applicant/profile/resume         -- returns pre-signed R2 URL
POST   /applicant/profile/cover-letter   -- returns pre-signed R2 URL
POST   /applicant/profile/portfolio      -- returns pre-signed R2 URL
POST   /applicant/profile/linkedin       -- link LinkedIn URL
POST   /applicant/profile/social         -- add social link
GET    /applicant/points                 -- current points + event history
```

#### Applicant Swipe
```
GET    /applicant/swipe/deck             -- paginated job listing cards
POST   /applicant/swipe/right/{job_id}   -- apply (swipe right)
POST   /applicant/swipe/left/{job_id}    -- dismiss (swipe left)
POST   /applicant/swipe/undo             -- undo last swipe (Pro only)
GET    /applicant/swipe/limits           -- daily count, limit, extra balance
```

#### Applicant Applications
```
GET    /applicant/applications           -- list of applied jobs + statuses
GET    /applicant/applications/{id}      -- single application detail
```

#### Applicant Subscriptions & Purchases
```
GET    /applicant/subscription
POST   /applicant/subscription/checkout  -- Stripe: returns checkout session URL
POST   /applicant/subscription/cancel
POST   /applicant/swipe-packs/checkout   -- purchase extra swipes (Stripe)
POST   /applicant/swipe-packs/iap        -- validate Apple/Google IAP receipt
```

#### Reviews
```
POST   /reviews                          -- submit review (must have applied)
GET    /reviews/company/{company_id}     -- get reviews (access controlled by tier)
POST   /reviews/{id}/flag                -- flag a review
```

#### Company Profile
```
GET    /company/profile
PUT    /company/profile
POST   /company/profile/logo             -- returns pre-signed R2 URL
POST   /company/profile/office-images    -- returns pre-signed R2 URL (per image)
DELETE /company/profile/office-images/{id}
```

#### Job Postings (HR)
```
GET    /company/jobs                     -- list company's postings
POST   /company/jobs                     -- create posting
GET    /company/jobs/{id}
PUT    /company/jobs/{id}
DELETE /company/jobs/{id}
POST   /company/jobs/{id}/publish
POST   /company/jobs/{id}/close
```

#### HR Swipe (Applicant Review)
```
GET    /company/jobs/{job_id}/applicants          -- prioritized applicant queue
GET    /company/jobs/{job_id}/applicants/{id}     -- full applicant profile view
POST   /company/jobs/{job_id}/swipe/right/{applicant_id}  -- send invitation
POST   /company/jobs/{job_id}/swipe/left/{applicant_id}   -- dismiss applicant
```

#### Company Subscription
```
GET    /company/subscription
POST   /company/subscription/checkout
POST   /company/subscription/cancel
POST   /company/verification/submit       -- submit verification docs
GET    /company/verification/status
```

#### Notifications
```
GET    /notifications
PATCH  /notifications/{id}/read
PATCH  /notifications/read-all
```

#### Admin (prefixed `/admin`, super_admin + moderator roles)
```
GET    /admin/dashboard/metrics
GET    /admin/verifications
GET    /admin/verifications/{id}
POST   /admin/verifications/{id}/approve
POST   /admin/verifications/{id}/reject
GET    /admin/reviews/flagged
POST   /admin/reviews/{id}/remove
POST   /admin/reviews/{id}/unflag
GET    /admin/users
POST   /admin/users/{id}/ban
POST   /admin/users/{id}/unban
GET    /admin/subscriptions
```

### 11.4 Response Format

```json
{
  "success": true,
  "data": {},
  "message": "string | null",
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### 11.5 Error Format

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "field_name": ["Error message."]
  },
  "code": "VALIDATION_ERROR"
}
```

### 11.6 Standard Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Form validation failed |
| `UNAUTHENTICATED` | 401 | No valid token |
| `UNAUTHORIZED` | 403 | Insufficient role/permission |
| `NOT_FOUND` | 404 | Resource not found |
| `SWIPE_LIMIT_REACHED` | 429 | Daily swipe limit hit |
| `LISTING_LIMIT_REACHED` | 403 | Active listing cap hit |
| `ALREADY_SWIPED` | 409 | Duplicate swipe attempted |
| `VERIFICATION_REQUIRED` | 403 | Company not yet verified |
| `SUBSCRIPTION_REQUIRED` | 403 | Feature needs active subscription |

---

## 12. Admin Panel

### 12.1 Access

- Deployed as a protected route within the Next.js web app (`/admin/*`).
- Protected by role middleware: `super_admin` and `moderator`.
- `super_admin` has full access. `moderator` has access to reviews, content flags, and read-only user lookup only.

### 12.2 Modules

#### Dashboard
- Total registered users (applicants, HR accounts, companies)
- Daily/weekly/monthly active users
- Total swipes (left/right, by day)
- Total applications submitted
- Total interview invitations sent
- Subscription revenue (monthly breakdown: Basic vs Pro, applicant vs company)
- Pending verification requests count

#### Company Verification Queue
- Lists all companies with `verification_status = 'pending'`
- Admin can view submitted documents (R2 signed URLs)
- Approve → sets `is_verified = true`, `verification_status = 'approved'`, triggers notification to company
- Reject → sets `verification_status = 'rejected'`, requires rejection reason, triggers notification

#### Review Moderation Queue
- Lists flagged reviews (`is_flagged = true`)
- Admin can view full review content, the applicant who wrote it, and the company it references
- Options: Remove (sets `is_visible = false`) or Unflag (dismiss flag, keep review visible)
- Removed reviews logged with moderator ID and timestamp

#### User Management
- Search users by email or name
- View subscription status, point total, account status
- Ban / unban user (sets `is_banned = true`, immediately invalidates all Sanctum tokens)
- View swipe history and application history (read-only)

#### Subscription Oversight
- List all active, cancelled, and past-due subscriptions
- Filter by type (applicant/company), tier (basic/pro), provider (stripe/iap)
- No billing actions from admin panel — billing managed through Stripe dashboard for web, IAP consoles for mobile

---

## 13. Security & Compliance

### 13.1 Authentication & Authorization

- Laravel Sanctum for stateless token auth (mobile) and SPA cookie auth (web).
- All tokens hashed before storage. Plaintext token only returned once at issue time.
- Middleware enforces role-based access on every protected route.
- Token revocation on logout, ban, and password reset.

### 13.2 API Security

- Rate limiting via Redis: 60 req/min per authenticated user, 20 req/min unauthenticated.
- Cloudflare WAF blocks known attack patterns, bad bots, and country-level threats if needed.
- All API traffic over HTTPS (TLS 1.2+). HTTP strictly redirected.
- CORS policy: only `https://jobswipe.ph` and `https://www.jobswipe.ph` whitelisted.
- Input validation via Laravel Form Requests + Zod on frontend.

### 13.3 File Security

- Resume, cover letters, and verification documents served via R2 **signed URLs** with a 15-minute expiry.
- Public files (company logos, office images) served via Cloudflare CDN.
- File type validation on upload: MIME type checked server-side, not just extension.
- Maximum file size enforced both client-side and server-side.

### 13.4 Payment Security

- **No raw card data handled by Laravel.** All card handling delegated to Stripe.js (web) and native IAP SDKs (mobile).
- Stripe webhooks verified via `Stripe-Signature` header on every event.
- IAP receipts validated server-side against Apple/Google APIs before granting benefits.
- Subscription state driven by webhooks, not client-side confirmation.

### 13.5 Data Privacy — Republic Act No. 10173 (Data Privacy Act of 2012)

JobSwipe collects and processes personal data (names, email, resume, employment history) and must comply with the Philippine DPA.

- **Privacy Policy** must be presented and explicitly accepted during registration.
- **Consent** is obtained for data collection, processing, and use.
- **Data Retention:** User data retained for the duration of account activity + 1 year. On account deletion request, data is anonymized within 30 days.
- **Right to Access & Erasure:** Users can request a data export and account deletion via in-app settings. Processed within 15 business days.
- **Data Breach Protocol:** NPC (National Privacy Commission) notified within 72 hours of a confirmed breach.
- **DPO (Data Protection Officer):** Must be designated and registered with the NPC upon launch.
- Passwords stored as bcrypt hashes (cost factor 12). Never stored in plaintext anywhere.
- PII fields encrypted at rest in PostgreSQL using column-level encryption for: `email`, `password_hash`. MongoDB encrypted at rest via storage engine encryption.

---

## 14. CI/CD Pipeline

### 14.1 Branch Strategy

```
main        → Production deployment (Vercel + EC2)
staging     → Staging deployment (Vercel preview + EC2 staging)
feature/*   → PR branches, preview deployments on Vercel
```

### 14.2 GitHub Actions — Backend (Laravel)

**On PR to `staging` or `main`:**
1. Install PHP dependencies (`composer install`)
2. Run PHPUnit tests
3. Run Laravel Pint (code style check)
4. Run PHPStan (static analysis)

**On merge to `main`:**
1. Build Docker image
2. Push to container registry (GitHub Container Registry or AWS ECR)
3. SSH into EC2, pull new image, run `docker compose up -d --build`
4. Run `php artisan migrate --force`
5. Restart Horizon workers

### 14.3 GitHub Actions — Frontend (Next.js)

- Vercel's GitHub integration handles automatic deployments.
- PR previews deployed automatically to `*.vercel.app`.
- `main` branch auto-deploys to `jobswipe.ph`.

### 14.4 GitHub Actions — Mobile (Expo EAS)

**On merge to `main`:**
1. `eas build --platform all --profile production` (triggered via EAS CLI in Actions)
2. OTA update pushed via `eas update --channel production` for JS-only changes

---

## 15. Environment Variables Reference

### Laravel (`.env`)

```env
APP_NAME=JobSwipe
APP_ENV=production
APP_KEY=
APP_URL=https://api.jobswipe.ph

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=jobswipe
DB_USERNAME=
DB_PASSWORD=

MONGODB_URI=mongodb://user:pass@host:27017/jobswipe

REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=6379

MAIL_MAILER=resend
RESEND_KEY=

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

CASHIER_CURRENCY=PHP
CASHIER_CURRENCY_LOCALE=fil_PH

APPLE_APP_BUNDLE_ID=ph.jobswipe.app
GOOGLE_PLAY_PACKAGE_NAME=ph.jobswipe.app

CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=jobswipe-assets
CLOUDFLARE_R2_URL=https://assets.jobswipe.ph

MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=

SENTRY_LARAVEL_DSN=

QUEUE_CONNECTION=redis
HORIZON_PREFIX=jobswipe

FRONTEND_URL=https://jobswipe.ph
```

### Next.js (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.jobswipe.ph/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

### Expo (`.env`)

```env
EXPO_PUBLIC_API_URL=https://api.jobswipe.ph/v1
EXPO_PUBLIC_SENTRY_DSN=
```

---

*End of JobSwipe v1 Documentation*