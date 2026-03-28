# JobSwipe — Follow-Up Answers & Implementation Details

> **Date:** 2026-03-28

---

## Corrections from Previous Analysis

Before answering, two corrections:

1. **Stripe webhook verification IS implemented** — [SubscriptionController.php L57-71](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#L57-L71) uses `Webhook::constructEvent()` with signature verification. My initial analysis was wrong on this point. ✅
2. **Daily swipe reset IS scheduled** — [console.php L16-20](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/console.php#L16-L20) already registers [ResetDailySwipesJob](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Jobs/ResetDailySwipesJob.php#13-41) daily at midnight Manila time. ✅

---

## 1. Email Verification Gate — What It Means & How to Implement

### The Problem

Right now, when a user logs in with an unverified email, `AuthService::login()` returns `'unverified'` and the controller returns a 403. **But there's nothing stopping an unverified user from calling other endpoints** if they already have a valid Sanctum token (e.g., they registered, got a token from Google OAuth, but never verified their email — or if a token was somehow issued before verification).

In your current code, the `auth:sanctum` middleware only checks that the token is valid, not that the user's email is verified. An unverified user with a valid token can hit every protected endpoint.

### The Fix — Create an `EnsureEmailVerified` Middleware

```php
<?php
// File: app/Http/Middleware/EnsureEmailVerified.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Your email address is not verified.',
                'code' => 'EMAIL_NOT_VERIFIED',
            ], 403);
        }

        return $next($request);
    }
}
```

**Register it in `bootstrap/app.php`** (Laravel 11 style):
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
        'swipe.limit' => \App\Http\Middleware\CheckSwipeLimit::class,
        'verified' => \App\Http\Middleware\EnsureEmailVerified::class,  // Add this
    ]);
})
```

**Apply it to all authenticated routes in [api.php](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/api.php):**
```php
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // All your protected routes here
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    // ... everything else
});
```

This guarantees no unverified user can use any protected endpoint regardless of how they obtained their token.

---

## 2. Stripe-Signature Verification — Correction

**I was wrong.** Your [SubscriptionController::handleWebhook()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Http/Controllers/Subscription/SubscriptionController.php#L57-L77) already does this correctly:

```php
$event = Webhook::constructEvent($payload, $signature, $secret);
```

This calls Stripe's SDK `Webhook::constructEvent()`, which:
1. Reads `Stripe-Signature` header
2. Validates HMAC signature against your `STRIPE_WEBHOOK_SECRET`
3. Throws `SignatureVerificationException` if the signature doesn't match

Your controller catches both `UnexpectedValueException` (malformed payload) and `SignatureVerificationException` (invalid signature) and returns 400. This is the correct implementation. Apologies for the false flag.

---

## 3. OTP Not Cleaned Up After Registration

### The Problem

In [AuthService::completeRegistration()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/AuthService.php#L51-L91), after successfully verifying the OTP and creating the user, the OTP data in Redis is **never explicitly deleted**:

```php
public function completeRegistration(string $email, string $code): array
{
    $result = $this->otp->verify($email, $code);        // Checks OTP
    $storedData = $this->otp->getStoredData($email);     // Gets password_hash + role
    
    // ... creates user, generates token ...
    
    return [
        'status' => 'verified',
        'token' => $token,
        'user' => $user,
    ];
    // ⚠️ OTP data still lives in Redis until TTL expires
}
```

The [OTPService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/OTPService.php#10-96) has a [clearStoredData()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/OTPService.php#76-80) method that's never called. This means:
- The same valid OTP code could theoretically be re-submitted during the Redis TTL window
- In [completeRegistration](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/AuthService.php#51-92), the duplicate insert would fail (email unique constraint), so it's not exploitable for duplicate accounts
- But it's still **bad hygiene** — clean data should be cleaned up

### The Fix

Add one line at the end of [completeRegistration()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/AuthService.php#51-92), after the transaction succeeds:

```php
public function completeRegistration(string $email, string $code): array
{
    $result = $this->otp->verify($email, $code);

    if ($result !== 'valid') {
        return ['status' => $result];
    }

    $storedData = $this->otp->getStoredData($email);

    if (! $storedData || ! isset($storedData['password_hash'], $storedData['role'])) {
        return ['status' => 'expired'];
    }

    DB::transaction(function () use ($email, $storedData, &$user, &$token) {
        $user = $this->users->create([
            'email' => strtolower(trim($email)),
            'password_hash' => $storedData['password_hash'],
            'role' => $storedData['role'],
            'email_verified_at' => now(),
        ]);
        $this->profiles->createProfileForUser($user);
        $token = $this->tokens->generateToken($user);
    });

    // ✅ Clean up OTP data from Redis now that registration is complete
    $this->otp->clearStoredData($email);

    SendWelcomeEmail::dispatch($user->id)->onQueue('emails');

    return [
        'status' => 'verified',
        'token' => $token,
        'user' => $user,
    ];
}
```

---

## 4. Cross-Platform Subscription Sync — Design Decisions

### The Core Challenge

A user can subscribe on **iOS** (Apple IAP), **Android** (Google Play Billing), or **Web** (Stripe). Your backend must:
1. Know which provider owns the active subscription
2. Prevent subscribing on two providers simultaneously
3. Handle renewals/cancellations from any provider
4. Apply the correct benefits regardless of where they subscribed

### Recommended Architecture

#### Principle 1: Single Source of Truth — The `subscriptions` Table

Your DB schema already has `payment_provider ENUM('stripe', 'apple_iap', 'google_play')`. The backend should **always** check this table for subscription status, never trust the client.

```
Rule: Only ONE active subscription per user at a time.
      The `subscriptions` table is the authority.
```

#### Principle 2: Provider-Agnostic Benefit Application

Create a single method that applies benefits regardless of provider:

```php
// In SubscriptionService.php (or a new SubscriptionBenefitService)
public function applySubscriptionBenefits(string $userId, string $tier): void
{
    // Same logic regardless of whether Stripe, Apple, or Google triggered it
    $user = User::findOrFail($userId);

    if ($user->role === 'applicant') {
        $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();
        $applicant->update([
            'subscription_tier' => $tier,
            'subscription_status' => 'active',
            'daily_swipe_limit' => $tier === 'pro' ? 999999 : 15,
        ]);
    } elseif (in_array($user->role, ['hr', 'company_admin'])) {
        $company = CompanyProfile::where('user_id', $userId)->firstOrFail();
        $company->update([
            'subscription_tier' => $tier === 'pro' ? 'pro' : 'basic',
            'subscription_status' => 'active',
        ]);
    }

    // Award subscription points
    $this->points->awardPoints($userId, "subscribed_{$tier}");
}
```

#### Principle 3: Pre-Checkout Guard — Prevent Double Subscribe

Before allowing ANY new subscription (regardless of platform):

```php
public function canSubscribe(string $userId): array
{
    $activeSubscription = Subscription::where('user_id', $userId)
        ->where('status', 'active')
        ->first();

    if ($activeSubscription) {
        return [
            'can_subscribe' => false,
            'reason' => 'ALREADY_SUBSCRIBED',
            'current_provider' => $activeSubscription->payment_provider,
            'current_tier' => $activeSubscription->tier,
            'message' => "You already have an active {$activeSubscription->tier} subscription via {$activeSubscription->payment_provider}. Cancel it first to switch platforms.",
        ];
    }

    return ['can_subscribe' => true];
}
```

This is called before [createCheckoutSession()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php#28-138) (Stripe), and before `validateIAPReceipt()` (Apple/Google).

#### Principle 4: Provider-Specific Validation, Unified Activation

```
┌────────────────────────────────────────────────────────────┐
│                   IAP Validation Flow                       │
│                                                             │
│  Mobile Client → POST /api/v1/subscription/iap             │
│                  { provider: "apple"|"google",              │
│                    receipt/token: "...",                     │
│                    product_id: "pro_monthly" }              │
│                                                             │
│  Backend:                                                   │
│  1. canSubscribe() → check no active sub exists             │
│  2. Route to AppleIAPValidator or GooglePlayValidator        │
│  3. Validate receipt with Apple/Google server APIs           │
│  4. Extract: product_id, transaction_id, expiry_date        │
│  5. Write to `subscriptions` table (provider-specific data) │
│  6. applySubscriptionBenefits() → same logic for all        │
│  7. Return success to mobile client                         │
└────────────────────────────────────────────────────────────┘
```

#### Principle 5: Webhook/Notification Handlers Per Provider

Each provider sends renewal/cancellation events differently. You need 3 webhook endpoints:

```php
// routes/api.php
Route::post('webhooks/stripe', [SubscriptionController::class, 'handleStripeWebhook']);
Route::post('webhooks/apple', [SubscriptionController::class, 'handleAppleNotification']);  // App Store Server Notifications V2
Route::post('webhooks/google', [SubscriptionController::class, 'handleGoogleNotification']); // RTDN
```

All three webhook handlers should ultimately call the same `applySubscriptionBenefits()` or `revokeSubscriptionBenefits()` methods.

#### Principle 6: Client-Side "Which Provider?" Endpoint

The mobile/web app needs to know the current subscription state. Add:

```php
GET /api/v1/subscription/status

Response:
{
    "has_active_subscription": true,
    "tier": "pro",
    "provider": "apple_iap",
    "expires_at": "2026-04-28T00:00:00Z",
    "can_subscribe": false,
    "manage_url": null  // or Stripe billing portal URL for web
}
```

The client uses `provider` to know:
- If [stripe](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/SubscriptionService.php#309-319) → show "Manage on Web" 
- If `apple_iap` → show "Manage in App Store Settings"
- If `google_play` → show "Manage in Google Play Store"

#### Architecture Summary

```
                    ┌───────────────────────────────────┐
                    │    SubscriptionService (unified)   │
                    │                                    │
                    │  canSubscribe()                    │
                    │  applySubscriptionBenefits()       │
                    │  revokeSubscriptionBenefits()      │
                    │  getSubscriptionStatus()           │
                    └──────────┬────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────────┐
    │ StripeProvider  │ │ AppleProvider│ │ GoogleProvider   │
    │                 │ │              │ │                  │
    │ createCheckout()│ │ validate()   │ │ validate()       │
    │ handleWebhook() │ │ handleNotif()│ │ handleNotif()    │
    │ cancelSub()     │ │              │ │                  │
    └─────────────────┘ └──────────────┘ └─────────────────┘
```

---

## 5. Code Duplication — Exact Locations

### Duplication Set 1: [ensureApplicantDocument()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#414-446)

**Duplicated in:**
- [ProfileService.php L414-444](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L414-L444)
- [ProfileOnboardingService.php L121-151](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#L121-L151)

Both methods are **identical** — they check if an `ApplicantProfileDocument` exists for the user, create one if not, and repair missing `user_id`.

**Retain in:** [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450) (or extract to a shared `ProfileDocumentResolver` trait/service)
**Delete from:** [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556) — replace with `$this->onboarding->ensureApplicantDocument()` or inject the shared service.

### Duplication Set 2: [ensureCompanyDocument()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#447-482)

**Duplicated in:**
- [ProfileService.php L447-481](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L447-L481)
- [ProfileOnboardingService.php L154-188](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#L154-L188)

Again **identical** logic — find by user_id, fallback to company_id, create if missing.

**Retain in:** [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450)
**Delete from:** [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556)

### Duplication Set 3: [findCompanyProfileByUserId()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#190-200)

**Duplicated in:**
- [ProfileService.php L483-492](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L483-L492)
- [ProfileOnboardingService.php L190-199](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#L190-L199)

**Retain in:** [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450) (or in `CompanyProfileRepository`)
**Delete from:** [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556)

### Duplication Set 4: [filled()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#522-526)

**Duplicated in:**
- [ProfileService.php L522-525](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L522-L525)
- [ProfileOnboardingService.php L445-448](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#L445-L448)

**Retain in:** Neither — extract to a shared trait or use Laravel's built-in [filled()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#522-526) helper.

### Duplication Set 5: Constants

**Duplicated in:**
- [ProfileService.php L17-21](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L17-L21): `APPLICANT_ONBOARDING_STEPS = 6`, `COMPANY_ONBOARDING_STEPS = 4`, `MAX_OFFICE_IMAGES = 6`
- [ProfileOnboardingService.php L15-19](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#L15-L19): Same 3 constants

**Retain in:** [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450) (it owns the onboarding logic)
**Delete from:** [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556) — reference via `ProfileOnboardingService::APPLICANT_ONBOARDING_STEPS`

### Recommended Refactor Strategy

The cleanest approach: [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556) should **delegate** to [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450) for document resolution. It already does this for [getOnboardingStatus()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#29-56) and [completeOnboardingStep()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#57-106) — just extend the pattern:

```php
// In ProfileService — replace all duplicated private methods with:
private function ensureApplicantDocument(string $userId): ApplicantProfileDocument
{
    return $this->onboarding->ensureApplicantDocument($userId);
}
```

This requires making [ensureApplicantDocument()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#414-446) and [ensureCompanyDocument()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#447-482) `public` in [ProfileOnboardingService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileOnboardingService.php#13-450) (they're currently `private`).

---

## 6. Daily Swipe Reset Job Scheduling — Correction

**This is already implemented.** I was wrong in the initial analysis.

[console.php L16-20](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/routes/console.php#L16-L20):
```php
Schedule::job(new ResetDailySwipesJob)
    ->dailyAt('00:00')
    ->timezone('Asia/Manila')
    ->name('reset-daily-swipes')
    ->withoutOverlapping();
```

The job resets `daily_swipes_used` to 0 in PostgreSQL and clears Redis `swipe:counter:*` keys. It runs at midnight Philippine time (Asia/Manila). This is correctly configured.

**One thing to ensure:** Your production server must run `php artisan schedule:run` every minute via cron (or Docker's scheduler service). Your Docker Compose should have a scheduler service like:

```yaml
scheduler:
  build: .
  command: ["sh", "-c", "while true; do php artisan schedule:run --verbose --no-interaction; sleep 60; done"]
```

---

## 7. Automatic Points Awarding from Profile Updates

### The Problem

`PointService::awardPoints()` exists and works, but it's **not called automatically** when profile data changes. The only place it's wired is in [ProfileService::updateApplicantProfile()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#L527-L554), which tracks changes and awards points. **However**, the individual update methods like [updateApplicantResume()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#179-186), [updateApplicantPhoto()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#195-202), [updateSocialLinks()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#203-212), etc., do **NOT** award points.

### The Fix — Wire Points into Individual Update Methods

Add point awarding to each relevant method in [ProfileService](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#15-556):

```php
public function updateApplicantResume(string $userId, string $resumeUrl): array
{
    $profile = $this->ensureApplicantDocument($userId);
    
    // Check if this is the first resume upload
    $isFirstResume = empty($profile->resume_url);
    
    $updated = $this->applicantDocs->update($profile, ['resume_url' => $resumeUrl]);

    // Award points for first resume upload
    if ($isFirstResume) {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $this->points->awardPoints($applicant->id, 'resume_uploaded');
    }

    return $this->withApplicantCompletion($updated);
}

public function updateApplicantPhoto(string $userId, string $photoUrl): array
{
    $profile = $this->ensureApplicantDocument($userId);
    
    $isFirstPhoto = empty($profile->profile_photo_url);
    
    $updated = $this->applicantDocs->update($profile, ['profile_photo_url' => $photoUrl]);

    if ($isFirstPhoto) {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $this->points->awardPoints($applicant->id, 'profile_photo_uploaded');
    }

    return $this->withApplicantCompletion($updated);
}

public function updateApplicantCoverLetter(string $userId, string $coverLetterUrl): array
{
    $profile = $this->ensureApplicantDocument($userId);
    
    $isFirstCoverLetter = empty($profile->cover_letter_url);
    
    $updated = $this->applicantDocs->update($profile, ['cover_letter_url' => $coverLetterUrl]);

    if ($isFirstCoverLetter) {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $this->points->awardPoints($applicant->id, 'cover_letter_uploaded');
    }

    return $this->withApplicantCompletion($updated);
}

public function updateApplicantBasicInfo(string $userId, array $data): array
{
    $profile = $this->ensureApplicantDocument($userId);
    
    // Check if bio is being added for the first time
    $isFirstBio = empty($profile->bio) && !empty($data['bio'] ?? null);
    
    $allowed = array_intersect_key($data, array_flip([
        'first_name', 'last_name', 'bio', 'location',
        'location_city', 'location_region',
    ]));
    $updated = $this->applicantDocs->update($profile, $allowed);

    if ($isFirstBio) {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $this->points->awardPoints($applicant->id, 'bio_added');
    }

    return $this->withApplicantCompletion($updated);
}

public function updateApplicantSkills(string $userId, array $skills): array
{
    $profile = $this->ensureApplicantDocument($userId);
    
    $hadLessThan3 = count($profile->skills ?? []) < 3;
    
    $updated = $this->applicantDocs->update($profile, ['skills' => array_values($skills)]);

    // Award points when user first reaches 3+ skills
    if ($hadLessThan3 && count($skills) >= 3) {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $this->points->awardPoints($applicant->id, 'skills_added');
    }

    return $this->withApplicantCompletion($updated);
}

public function updateSocialLinks(string $userId, array $socialLinks): array
{
    $this->validateSocialLinks($socialLinks);
    $profile = $this->ensureApplicantDocument($userId);
    
    $existingPlatforms = collect($profile->social_links ?? [])->pluck('platform')->toArray();
    
    $updated = $this->applicantDocs->update($profile, ['social_links' => $socialLinks]);

    // Award points for newly added platforms (max 3)
    $applicant = $this->applicantProfiles->findByUserId($userId);
    foreach ($socialLinks as $link) {
        if (!in_array($link['platform'], $existingPlatforms)) {
            // Check if linkedin specifically
            if (strtolower($link['platform']) === 'linkedin') {
                $this->points->awardPoints($applicant->id, 'linkedin_linked');
            } else {
                $this->points->awardPoints($applicant->id, 'social_linked', $link['platform']);
            }
        }
    }

    return $this->withApplicantCompletion($updated);
}
```

### Why This Works

`PointService::awardPoints()` already handles idempotency — it catches exceptions from duplicate `point_events` inserts (the unique index prevents awarding the same one-time event twice). So even if a user calls [updateApplicantResume()](file:///Users/apple/Desktop/DevWork/Project/JobSwipe/JobSwipe/backend/app/Services/ProfileService.php#179-186) 10 times, points are only awarded once.

### Alternative: Event-Driven Approach (Cleaner, but more work)

Instead of hardcoding point triggers in every method, you could use Laravel Events:

```php
// Events: ProfilePhotoUploaded, ResumeUploaded, BioAdded, etc.
// Listener: AwardPointsListener that checks event type and calls PointService

// In ProfileService:
event(new ResumeUploaded($userId));

// In EventServiceProvider:
ResumeUploaded::class => [AwardPointsListener::class],
BioAdded::class => [AwardPointsListener::class],
```

This is cleaner but adds more files. For your current codebase size, the inline approach above is simpler and sufficient.
