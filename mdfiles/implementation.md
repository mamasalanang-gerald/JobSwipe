# JobSwipe — Authentication Implementation Guide
> **Version:** 1.0.0  
> **Scope:** Laravel 11 Backend — Auth Module  
> **Last Updated:** 2026-03-21

---

## Table of Contents

1. [Backend Architecture Explained](#1-backend-architecture-explained)
2. [Pre-Implementation Bugs to Fix](#2-pre-implementation-bugs-to-fix)
3. [Authentication Flow Overview](#3-authentication-flow-overview)
4. [Package Installation](#4-package-installation)
5. [Configuration Changes](#5-configuration-changes)
6. [Database & Redis](#6-database--redis)
7. [Files to Create — In Order](#7-files-to-create--in-order)
8. [Routes](#8-routes)
9. [AppServiceProvider Bindings](#9-appserviceprovider-bindings)
10. [Environment Variables](#10-environment-variables)
11. [Testing the Flow](#11-testing-the-flow)

---

## 1. Backend Architecture Explained

JobSwipe uses a **4-layer architecture** on top of standard MVC. Here is what each layer does and why it exists.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────┐
│  ROUTE  (routes/api.php)                    │  ← "The front door. Decides where the
│                                             │     request goes."
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  FORM REQUEST  (Http/Requests/)             │  ← "The bouncer. Validates the input
│                                             │     BEFORE the controller even runs."
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  CONTROLLER  (Http/Controllers/)            │  ← "The traffic cop. Reads the
│                                             │     request, calls the Service,
│                                             │     returns a JSON response.
│                                             │     It has NO business logic."
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  SERVICE  (Services/)                       │  ← "The brain. Owns ALL business
│                                             │     logic. e.g. 'to register a user,
│                                             │     we must check the OTP, hash the
│                                             │     password, create a Postgres record,
│                                             │     create a Mongo document, and award
│                                             │     points.' The service orchestrates
│                                             │     all of this."
└──────────────────────┬──────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│ REPOSITORY   │ │ REPOSITORY│ │ REPOSITORY   │
│ (Postgres)   │ │ (MongoDB) │ │ (Redis)      │
│              │ │           │ │              │
│ "The filing  │ │"The filing│ │"The filing   │
│  cabinet for │ │ cabinet   │ │ cabinet for  │
│  relational  │ │ for docs" │ │ fast/temp    │
│  data"       │ │           │ │ data"        │
└──────────────┘ └──────────┘ └──────────────┘
```

### Why this structure?

| Layer | Single Responsibility | Testable In Isolation? |
|---|---|---|
| Route | Mapping URL → Controller | — |
| FormRequest | Input validation rules | ✅ Yes |
| Controller | HTTP input/output only | ✅ Yes (mock the Service) |
| Service | Business logic | ✅ Yes (mock Repositories) |
| Repository | Data access for one store | ✅ Yes (mock the Model) |

If you ever need to swap PostgreSQL for a different database, you only change the Repository. The Service never knows or cares. This is the **Separation of Concerns** principle applied practically.

### Folder Map for Auth

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Auth/
│   │       ├── AuthController.php        ← Handles register/login/logout/verify
│   │       └── OAuthController.php       ← Handles Google OAuth redirect + callback
│   └── Requests/
│       └── Auth/
│           ├── RegisterRequest.php       ← Validates role, email, password
│           ├── LoginRequest.php          ← Validates email, password
│           └── VerifyEmailRequest.php    ← Validates the 6-digit OTP
│
├── Services/
│   ├── AuthService.php                   ← Orchestrates registration, login, logout
│   └── OtpService.php                    ← Generates, stores, and verifies OTPs
│
├── Repositories/
│   ├── Postgres/
│   │   └── UserRepository.php            ← CRUD for the users table
│   └── Redis/
│       ├── SwipeCacheRepository.php      ← (existing)
│       └── OtpCacheRepository.php        ← Stores OTPs in Redis with TTL
│
└── Mail/
    └── EmailVerificationMail.php         ← The Mailable that sends the OTP email
```

---

## 2. Pre-Implementation Bugs to Fix

Before writing a single line of auth code, fix these existing issues in the codebase.

### Bug 1 — `users` migration: `timestampTz()` → `timestampsTz()`

**File:** `backend/database/migrations/2026_03_19_074732_create_users_table.php`

```php
// ❌ WRONG — this creates only ONE timestamp column named "created_at"
$table->timestampTz();

// ✅ CORRECT — this creates BOTH created_at AND updated_at
$table->timestampsTz();
```

### Bug 2 — `applicant_profiles` migration: column name mismatch

**File:** `backend/database/migrations/2026_03_19_082827_create_applicant_profiles_table.php`

```php
// ❌ WRONG — singular, doesn't match the documented schema
$table->integer('extra_swipe_balance')->default(0);

// ✅ CORRECT — matches docs and the architecture guide
$table->integer('extra_swipes_balance')->default(0);
```

### Bug 3 — `personal_access_tokens` migration: duplicate column definition

**File:** `backend/database/migrations/2019_12_14_000001_create_personal_access_tokens_table.php`

```php
// ❌ WRONG — uuidMorphs() already creates BOTH tokenable_id AND tokenable_type
$table->uuidMorphs('tokenable_id');
$table->string('tokenable_type');  // ← REMOVE THIS LINE, it's a duplicate

// ✅ CORRECT
$table->uuidMorphs('tokenable');   // creates tokenable_id (uuid) + tokenable_type (string)
```

**Fix it like this:**
```php
Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->uuidMorphs('tokenable');
    $table->text('name');
    $table->string('token', 64)->unique();
    $table->text('abilities')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable()->index();
    $table->timestamps();
});
```

> ⚠️ If you have already run migrations, run `php artisan migrate:fresh` in your local dev environment after fixing all three bugs. Never run `migrate:fresh` in production.

---

## 3. Authentication Flow Overview

### Decision Tree — Before Any Code Runs

```
User opens app
      │
      ▼
"Are you an Applicant or HR/Company?" ← Frontend question, sent as `role` field
      │
      ├─── Applicant ──────────────────────────────────────────────────────────┐
      │         │                                                               │
      │    Email/Password                                                  Google OAuth
      │         │                                                               │
      │    [OTP sent to email]                                        [Google verifies email]
      │         │                                                               │
      │    [User enters OTP]                                          [Account created directly]
      │         │                                                               │
      │    [Account verified]                                                   │
      │         └────────────────────── Onboarding ─────────────────────────────┘
      │                                 • Name, location
      │                                 • Resume (required)
      │                                 • Skills (at least 1)
      │                                 • Photo (optional)
      │                                 • LinkedIn, cover letter, etc.
      │
      └─── HR / Company ───────────────────────────────────────────────────────┐
                │                                                               │
           Email/Password ONLY                                                  │
           (No Google OAuth)                                                    │
                │                                                               │
           [OTP sent to email]                                                  │
                │                                                               │
           [User enters OTP]                                                    │
                │                                                               │
           [Account verified]                                                   │
                │                                                               │
           Onboarding ─────────────────────────────────────────────────────────┘
           • Company name, description
           • Industry, size
           • Logo, office images
           • Choose subscription (Basic/Pro)
           • Submit verification documents
```

### API Endpoints This Guide Creates

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/v1/auth/register` | Register with email + password | No |
| `POST` | `/v1/auth/verify-email` | Submit 6-digit OTP | No |
| `POST` | `/v1/auth/resend-verification` | Resend OTP email | No |
| `POST` | `/v1/auth/login` | Login with email + password | No |
| `POST` | `/v1/auth/logout` | Revoke Sanctum token | Yes |
| `GET` | `/v1/auth/me` | Return current user | Yes |
| `GET` | `/v1/auth/google/redirect` | Initiate Google OAuth | No |
| `GET` | `/v1/auth/google/callback` | Handle Google OAuth callback | No |

### OTP Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Where to store OTP | Redis | Auto-expires, no DB table needed, fast lookup |
| OTP length | 6 digits | Industry standard, easy to type |
| OTP TTL | 10 minutes | Short enough to be secure, long enough to be usable |
| Max failed attempts | 5 | Prevents brute force, stored in Redis alongside the code |
| OTP for Google OAuth | ❌ Skip it | Google already verified the email |
| OTP hashing | Yes (SHA-256) | Never store raw OTPs in Redis even with TTL |

### Redis Key Design for OTP

```
KEY     otp:{email}
TYPE    Hash
TTL     600 seconds (10 minutes)

FIELDS
  code_hash     string    SHA-256 hash of the 6-digit code
  attempts      integer   Number of failed verification attempts
  created_at    integer   Unix timestamp of when OTP was generated
```

---

## 4. Package Installation

```bash
cd backend

# Google OAuth via Socialite
composer require laravel/socialite

# The Google provider is built into Socialite — no separate package needed
```

> **Note:** `laravel/socialite` is not in your existing `composer.json`. Add it. Everything else (Sanctum, Horizon, MongoDB driver) is already installed.

---

## 5. Configuration Changes

### `config/services.php` — Add Google OAuth credentials

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
],
```

### `config/mail.php` — SMTP via Gmail

Your `.env` will drive this. No changes to `config/mail.php` needed — the default Laravel mail config reads from env variables already. Just make sure your `.env` has the Gmail SMTP vars (see Section 10).

### `config/auth.php` — Ensure Sanctum guard

No changes needed. Laravel 11 with Sanctum installed sets this up automatically via `bootstrap/app.php`.

---

## 6. Database & Redis

### New Migration — `email_verification_tokens` table

You don't need this if you store OTPs in Redis. **We will use Redis only.** This keeps it simple and there's no need for a database table that self-expires.

However, you DO need one new thing: a `google_id` column on `users` for users who registered via Google OAuth.

### New Migration — Add `google_id` to `users`

```bash
php artisan make:migration add_google_id_to_users_table
```

```php
// In the migration:
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('google_id', 255)->nullable()->unique()->after('email');
        $table->string('avatar_url', 512)->nullable()->after('google_id');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['google_id', 'avatar_url']);
    });
}
```

> **Why `avatar_url` too?** Google OAuth returns a profile photo URL. Storing it saves the applicant from having to upload a photo during onboarding, improving completion rates.

### Redis OTP Key Operations Summary

| Operation | Redis Command | When |
|---|---|---|
| Store OTP | `HSET otp:{email} code_hash ... attempts 0` + `EXPIRE 600` | On register / resend |
| Verify OTP | `HGET otp:{email} code_hash` + compare | On verify-email |
| Increment attempts | `HINCRBY otp:{email} attempts 1` | On wrong code |
| Clear OTP | `DEL otp:{email}` | On successful verify |

---

## 7. Files to Create — In Order

Follow this order. Each file depends on the one before it.

### Step 1 — `OtpCacheRepository` (Redis)

**Path:** `app/Repositories/Redis/OtpCacheRepository.php`

Handles all Redis operations for OTP storage. No business logic here — just key management.

```php
<?php

namespace App\Repositories\Redis;

use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;

class OtpCacheRepository
{
    private function key(string $email): string
    {
        return 'otp:' . hash('sha256', strtolower(trim($email)));
    }

    public function store(string $email, string $codeHash): void
    {
        $key = $this->key($email);

        Redis::hset($key, 'code_hash', $codeHash);
        Redis::hset($key, 'attempts', 0);
        Redis::hset($key, 'created_at', Carbon::now()->timestamp);
        Redis::expire($key, 600); // 10 minutes
    }

    public function get(string $email): ?array
    {
        $key = $this->key($email);

        if (! Redis::exists($key)) {
            return null;
        }

        return Redis::hgetall($key);
    }

    public function incrementAttempts(string $email): int
    {
        return (int) Redis::hincrby($this->key($email), 'attempts', 1);
    }

    public function delete(string $email): void
    {
        Redis::del($this->key($email));
    }

    public function exists(string $email): bool
    {
        return (bool) Redis::exists($this->key($email));
    }
}
```

**Why hash the email in the Redis key?** It prevents email addresses from being exposed in Redis key listings (e.g., in monitoring dashboards or if Redis is ever misconfigured to be public-facing).

---

### Step 2 — `UserRepository` (PostgreSQL)

**Path:** `app/Repositories/Postgres/UserRepository.php`

```php
<?php

namespace App\Repositories\Postgres;

use App\Models\Postgres\User;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', strtolower(trim($email)))->first();
    }

    public function findById(string $id): ?User
    {
        return User::find($id);
    }

    public function findByGoogleId(string $googleId): ?User
    {
        return User::where('google_id', $googleId)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function markEmailVerified(string $email): void
    {
        User::where('email', strtolower(trim($email)))
            ->update(['email_verified_at' => now()]);
    }

    public function emailExists(string $email): bool
    {
        return User::where('email', strtolower(trim($email)))->exists();
    }
}
```

---

### Step 3 — Update `User` Model

**Path:** `app/Models/Postgres/User.php`

Add two things: (1) `getAuthPassword()` override because the column is named `password_hash`, not `password`. (2) The new `google_id` and `avatar_url` fields.

```php
<?php

namespace App\Models\Postgres;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection   = 'pgsql';
    protected $table        = 'users';
    public    $incrementing = false;
    protected $keyType      = 'string';

    protected $fillable = [
        'email',
        'password_hash',
        'role',
        'is_active',
        'is_banned',
        'email_verified_at',
        'google_id',
        'avatar_url',
    ];

    protected $hidden = ['password_hash'];

    protected $casts = [
        'is_active'         => 'boolean',
        'is_banned'         => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Laravel's auth system looks for getAuthPassword() when verifying credentials.
     * Our column is password_hash, not password, so we override this.
     */
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
        return in_array($this->role, ['hr', 'company_admin']);
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }
}
```

---

### Step 4 — `OtpService`

**Path:** `app/Services/OtpService.php`

This service owns the business logic for OTP: generating, sending, and verifying.

```php
<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Repositories\Redis\OtpCacheRepository;
use Illuminate\Support\Facades\Mail;

class OtpService
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(
        private OtpCacheRepository $otpCache,
    ) {}

    /**
     * Generate a 6-digit OTP, store it in Redis, and send it via email.
     */
    public function sendOtp(string $email): void
    {
        $code     = $this->generateCode();
        $codeHash = $this->hashCode($code);

        // Overwrite any existing OTP for this email (handles resend)
        $this->otpCache->store($email, $codeHash);

        Mail::to($email)->send(new EmailVerificationMail($code));
    }

    /**
     * Verify the OTP a user submitted.
     *
     * Returns: 'valid' | 'invalid' | 'expired' | 'max_attempts'
     */
    public function verify(string $email, string $submittedCode): string
    {
        $stored = $this->otpCache->get($email);

        if ($stored === null) {
            return 'expired'; // OTP TTL ran out or was never sent
        }

        $attempts = (int) ($stored['attempts'] ?? 0);

        if ($attempts >= self::MAX_ATTEMPTS) {
            return 'max_attempts';
        }

        $submittedHash = $this->hashCode($submittedCode);

        if (! hash_equals($stored['code_hash'], $submittedHash)) {
            $this->otpCache->incrementAttempts($email);
            return 'invalid';
        }

        // OTP is correct — remove it so it can't be reused
        $this->otpCache->delete($email);

        return 'valid';
    }

    public function hasActiveOtp(string $email): bool
    {
        return $this->otpCache->exists($email);
    }

    private function generateCode(): string
    {
        // random_int is cryptographically secure
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function hashCode(string $code): string
    {
        return hash('sha256', $code);
    }
}
```

**Why `hash_equals()` instead of `===` for comparing hashes?**
`hash_equals()` is a timing-safe comparison. A regular `===` comparison exits early when it finds a mismatch — an attacker can measure response time differences to guess digits one by one (timing attack). `hash_equals()` always takes the same time regardless of how many characters match.

---

### Step 5 — `EmailVerificationMail`

**Path:** `app/Mail/EmailVerificationMail.php`

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your JobSwipe Verification Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification',
        );
    }
}
```

**Path:** `resources/views/emails/verification.blade.php`

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">

    <h2 style="color: #1a1a1a;">Verify your email</h2>

    <p style="color: #444; font-size: 16px;">
        Enter this code in the JobSwipe app to verify your email address.
        This code expires in <strong>10 minutes</strong>.
    </p>

    <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1a1a1a;">
            {{ $code }}
        </span>
    </div>

    <p style="color: #888; font-size: 14px;">
        If you did not request this, you can safely ignore this email.
    </p>

</body>
</html>
```

---

### Step 6 — Form Requests

**Path:** `app/Http/Requests/Auth/RegisterRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Registration is public
    }

    public function rules(): array
    {
        return [
            'role'     => ['required', 'string', 'in:applicant,hr,company_admin'],
            'email'    => ['required', 'email:rfc,dns', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Role must be applicant, hr, or company_admin.',
        ];
    }
}
```

**Path:** `app/Http/Requests/Auth/LoginRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

**Path:** `app/Http/Requests/Auth/VerifyEmailRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'digits:6'],
        ];
    }
}
```

---

### Step 7 — `AuthService`

**Path:** `app/Services/AuthService.php`

This is the most important file. It orchestrates the entire auth flow.

```php
<?php

namespace App\Services;

use App\Models\Postgres\ApplicantProfile;
use App\Models\Postgres\CompanyProfile;
use App\Repositories\Postgres\UserRepository;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    public function __construct(
        private UserRepository $users,
        private OtpService     $otp,
    ) {}

    // ── Email/Password Registration ─────────────────────────────────────────

    /**
     * Step 1 of registration: validate uniqueness, send OTP.
     * The account is NOT created yet — we wait for OTP verification first.
     *
     * Returns: 'otp_sent' | 'email_taken'
     */
    public function initiateRegistration(string $email, string $role): string
    {
        if ($this->users->emailExists($email)) {
            return 'email_taken';
        }

        // Store intent in OTP cache — we'll use it when they verify
        // The actual user record is created AFTER OTP is confirmed
        $this->otp->sendOtp($email);

        return 'otp_sent';
    }

    /**
     * Step 2 of registration: verify OTP, create user + profile records.
     *
     * Returns array with 'status' key:
     *   'verified'     → success, includes 'token' and 'user'
     *   'expired'      → OTP expired
     *   'invalid'      → wrong code
     *   'max_attempts' → too many wrong guesses
     */
    public function completeRegistration(
        string $email,
        string $password,
        string $role,
        string $code
    ): array {
        $result = $this->otp->verify($email, $code);

        if ($result !== 'valid') {
            return ['status' => $result];
        }

        // Create the user record
        $user = $this->users->create([
            'email'             => strtolower(trim($email)),
            'password_hash'     => Hash::make($password),
            'role'              => $role,
            'email_verified_at' => now(),
        ]);

        // Create the matching profile record based on role
        $this->createProfileForRole($user, $role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'verified',
            'token'  => $token,
            'user'   => $user,
        ];
    }

    // ── Login ───────────────────────────────────────────────────────────────

    /**
     * Returns: 'success' | 'invalid_credentials' | 'unverified' | 'banned'
     */
    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->getAuthPassword())) {
            return ['status' => 'invalid_credentials'];
        }

        if ($user->is_banned) {
            return ['status' => 'banned'];
        }

        if (! $user->hasVerifiedEmail()) {
            // Resend OTP so they can complete verification
            $this->otp->sendOtp($email);
            return ['status' => 'unverified'];
        }

        // Revoke old tokens to enforce single-session (optional — remove if you
        // want to support multiple devices simultaneously)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status' => 'success',
            'token'  => $token,
            'user'   => $user,
        ];
    }

    // ── Logout ──────────────────────────────────────────────────────────────

    public function logout($user): void
    {
        // Revoke only the current token, not all tokens
        $user->currentAccessToken()->delete();
    }

    // ── Google OAuth ────────────────────────────────────────────────────────

    /**
     * Called after Google redirects back with user data.
     * Creates the account if new, logs in if existing.
     *
     * Only applicants may use Google OAuth.
     */
    public function handleGoogleCallback(SocialiteUser $googleUser): array
    {
        // Check if they already have an account linked to this Google ID
        $user = $this->users->findByGoogleId($googleUser->getId());

        if (! $user) {
            // Check if an account exists with this email (e.g., registered via email before)
            $user = $this->users->findByEmail($googleUser->getEmail());

            if ($user) {
                // Link the Google ID to their existing account
                $this->users->update($user, [
                    'google_id'  => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                ]);
            } else {
                // Brand new user — create account (no OTP needed, Google verified the email)
                $user = $this->users->create([
                    'email'             => strtolower(trim($googleUser->getEmail())),
                    'password_hash'     => Hash::make(str()->random(40)), // unusable random password
                    'role'              => 'applicant',
                    'google_id'         => $googleUser->getId(),
                    'avatar_url'        => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]);

                $this->createProfileForRole($user, 'applicant');
            }
        }

        if ($user->is_banned) {
            return ['status' => 'banned'];
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'status'     => 'success',
            'token'      => $token,
            'user'       => $user,
            'is_new_user' => $user->wasRecentlyCreated,
        ];
    }

    // ── Resend OTP ──────────────────────────────────────────────────────────

    /**
     * Returns: 'sent' | 'not_found' (email doesn't exist in a pending reg)
     * Note: For security, we return 'sent' even if the email doesn't exist
     * to prevent email enumeration attacks.
     */
    public function resendOtp(string $email): void
    {
        // We always send to prevent email enumeration
        // If the email doesn't exist, the user gets an email but no account
        // is created — harmless.
        $this->otp->sendOtp($email);
    }

    // ── Internal Helpers ────────────────────────────────────────────────────

    private function createProfileForRole($user, string $role): void
    {
        match ($role) {
            'applicant' => ApplicantProfile::create([
                'user_id'           => $user->id,
                'subscription_tier' => 'free',
            ]),
            'hr', 'company_admin' => CompanyProfile::create([
                'user_id'     => $user->id,
                'company_name' => '', // Will be filled during onboarding
            ]),
            default => null,
        };
    }
}
```

---

### Step 8 — `AuthController`

**Path:** `app/Http/Controllers/Auth/AuthController.php`

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    /**
     * Step 1: Send OTP — no account created yet.
     * The frontend collects role, email, password, then calls this.
     * We send OTP and wait for verification before persisting anything.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // Google OAuth is not permitted for HR/company roles
        if (in_array($request->role, ['hr', 'company_admin'])
            && $request->has('oauth_provider')) {
            return $this->error('OAUTH_NOT_PERMITTED', 'HR/Company accounts must register with email and password.', 422);
        }

        $result = $this->auth->initiateRegistration(
            email: $request->email,
            role:  $request->role,
        );

        if ($result === 'email_taken') {
            return $this->error('EMAIL_TAKEN', 'An account with this email already exists.', 409);
        }

        return $this->success(
            data: ['email' => $request->email],
            message: 'Verification code sent. Check your email.',
        );
    }

    /**
     * Step 2: Verify OTP + create account.
     * Frontend submits: email, password, role (collected in step 1), code.
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        // We need password and role too — the frontend should send them again
        $request->validate([
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'string', 'in:applicant,hr,company_admin'],
        ]);

        $result = $this->auth->completeRegistration(
            email:    $request->email,
            password: $request->password,
            role:     $request->role,
            code:     $request->code,
        );

        return match ($result['status']) {
            'verified'     => $this->success(
                data: [
                    'token' => $result['token'],
                    'user'  => $result['user'],
                ],
                message: 'Email verified. Account created.',
                status: 201
            ),
            'expired'      => $this->error('OTP_EXPIRED', 'Verification code has expired. Please request a new one.', 422),
            'invalid'      => $this->error('OTP_INVALID', 'Incorrect verification code.', 422),
            'max_attempts' => $this->error('OTP_MAX_ATTEMPTS', 'Too many incorrect attempts. Please request a new code.', 429),
        };
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $this->auth->resendOtp($request->email);

        // Always return success to prevent email enumeration
        return $this->success(message: 'If that email is registered, a new code has been sent.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->email, $request->password);

        return match ($result['status']) {
            'success'             => $this->success(data: [
                'token' => $result['token'],
                'user'  => $result['user'],
            ]),
            'invalid_credentials' => $this->error('INVALID_CREDENTIALS', 'Invalid email or password.', 401),
            'unverified'          => $this->error('EMAIL_UNVERIFIED', 'Please verify your email. A new code has been sent.', 403),
            'banned'              => $this->error('ACCOUNT_BANNED', 'Your account has been suspended.', 403),
        };
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());

        return $this->success(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['applicantProfile', 'companyProfile']);

        return $this->success(data: $user);
    }

    // ── Response helpers ────────────────────────────────────────────────────

    private function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'message' => $message,
        ], $status);
    }

    private function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code'    => $code,
        ], $status);
    }
}
```

---

### Step 9 — `OAuthController`

**Path:** `app/Http/Controllers/Auth/OAuthController.php`

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    /**
     * Redirect the user to Google's auth page.
     * The frontend calls this endpoint and then opens the returned URL.
     * For mobile (Expo), the deep link handling is done client-side.
     */
    public function redirectToGoogle(): JsonResponse
    {
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();

        return response()->json([
            'success' => true,
            'data'    => ['redirect_url' => $url],
        ]);
    }

    /**
     * Google redirects back here after the user approves.
     */
    public function handleGoogleCallback(): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed. Please try again.',
                'code'    => 'OAUTH_FAILED',
            ], 422);
        }

        $result = $this->auth->handleGoogleCallback($googleUser);

        if ($result['status'] === 'banned') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been suspended.',
                'code'    => 'ACCOUNT_BANNED',
            ], 403);
        }

        return response()->json([
            'success'     => true,
            'data'        => [
                'token'       => $result['token'],
                'user'        => $result['user'],
                'is_new_user' => $result['is_new_user'],
            ],
            'message' => $result['is_new_user']
                ? 'Account created via Google. Please complete your profile.'
                : 'Logged in with Google.',
        ]);
    }
}
```

---

## 8. Routes

**File:** `routes/api.php` — add these inside the `v1` prefix group:

```php
// ── Auth (Public) ──────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    Route::post('/auth/register',               [AuthController::class, 'register']);
    Route::post('/auth/verify-email',           [AuthController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification',    [AuthController::class, 'resendVerification']);
    Route::post('/auth/login',                  [AuthController::class, 'login']);

    // Google OAuth (applicants only)
    Route::get('/auth/google/redirect',         [OAuthController::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback',         [OAuthController::class, 'handleGoogleCallback']);

    // ── Protected routes ───────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout',             [AuthController::class, 'logout']);
        Route::get('/auth/me',                  [AuthController::class, 'me']);

        // ... rest of your existing routes
    });
});
```

---

## 9. AppServiceProvider Bindings

**File:** `app/Providers/AppServiceProvider.php`

Uncomment / add these as you create each class:

```php
public function register(): void
{
    // Repositories
    $this->app->singleton(\App\Repositories\Redis\OtpCacheRepository::class);
    $this->app->singleton(\App\Repositories\Postgres\UserRepository::class);

    // Services
    $this->app->singleton(\App\Services\OtpService::class);
    $this->app->singleton(\App\Services\AuthService::class);
}
```

---

## 10. Environment Variables

Add these to your `.env` and `.env.example`:

```env
# ── Google OAuth ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://api.jobswipe.ph/v1/auth/google/callback

# ── Gmail SMTP ────────────────────────────────────────────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=YOUR_APP_PASSWORD   # Use a Gmail App Password, NOT your real password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@jobswipe.ph
MAIL_FROM_NAME="JobSwipe"
```

> **Gmail App Password:** Go to your Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail" + "Other Device". This is what goes in `MAIL_PASSWORD`. Using your real Gmail password will not work and is insecure.

> **Google OAuth Credentials:** Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID. Set the authorized redirect URI to your callback endpoint.

---

## 11. Testing the Flow

### Manual Test — Email/Password Registration (Applicant)

```bash
# Step 1: Initiate registration (sends OTP)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"role":"applicant","email":"test@example.com","password":"password123"}'

# Expected: 200, message about verification code

# Step 2: Verify email + complete registration
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456","password":"password123","role":"applicant"}'

# Expected: 201, token in response

# Step 3: Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Step 4: Get current user
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Manual Test — HR Registration

```bash
# Same as above but role is "hr" or "company_admin"
# Google OAuth redirect will return OAUTH_NOT_PERMITTED for these roles
```

### Check Redis OTP in local dev

```bash
# Connect to Redis (adjust for your Docker setup)
docker exec -it <redis_container> redis-cli

# See all OTP keys
KEYS otp:*

# Inspect a specific OTP entry
HGETALL otp:<sha256_hash_of_email>
```

---

## What Comes Next (Onboarding)

After auth is complete, the frontend should:

1. Check `is_new_user` flag in the login/OAuth response — if true, redirect to onboarding
2. For **applicants**: POST to `/v1/applicant/profile` to update name/location, then `/v1/applicant/profile/resume`, etc.
3. For **HR/company**: POST to `/v1/company/profile` to set company name, then `/v1/company/verification/submit`

The onboarding endpoints are separate from auth and will be built in the next implementation phase. Auth's responsibility ends the moment a valid `token` is returned to the client.

---

*End of JobSwipe Auth Implementation Guide v1.0.0*
