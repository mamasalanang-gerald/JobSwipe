# JobSwipe Backend Test Suite Reference

## Scope
This document explains the backend tests currently under `backend/tests/Unit`, why they exist, what success looks like, and what common failures usually mean.

## Quick Run Commands
Run from project root (`JobSwipe/`):

```bash
docker compose up -d --build
docker compose exec laravel php artisan test --testsuite=Unit
```

Run by category:

```bash
docker compose exec laravel php artisan test tests/Unit/Middleware
docker compose exec laravel php artisan test tests/Unit/Services
docker compose exec laravel php artisan test tests/Unit/Controllers
docker compose exec laravel php artisan test tests/Unit/Requests
docker compose exec laravel php artisan test tests/Unit/Exceptions
docker compose exec laravel php artisan test tests/Unit/Routes
docker compose exec laravel php artisan test tests/Unit/Repositories
```

## Test Inventory

### Middleware

#### `backend/tests/Unit/Middleware/CheckRolePropertyTest.php`
- Purpose: Validate role middleware behavior for authenticated/unauthenticated users and allowed/denied roles.
- Success means:
  - Unauthenticated request returns `401` with `UNAUTHENTICATED`.
  - Role mismatch returns `403` with `UNAUTHORIZED`.
  - Allowed roles pass through successfully.
- Typical failures indicate:
  - `CheckRole` changed response shape/status codes.
  - Role comparison logic or request user resolver assumptions changed.

### Services

#### `backend/tests/Unit/Services/FileUploadServiceUnitTest.php`
- Purpose: Verify normal file upload service behavior.
- Success means:
  - Valid upload generates `upload_url`, `file_key`, `public_url`, `expires_in`.
  - Invalid file type raises `FileUploadException`.
  - Oversized file raises `FileUploadException`.
  - Trusted URL passes validation.
  - Untrusted URL is rejected.
- Typical failures indicate:
  - File type/size constants changed.
  - URL validation rules no longer match configured R2 public URL.

#### `backend/tests/Unit/Services/FileUploadServicePropertyTest.php`
- Purpose: Validate invariants across multiple upload inputs.
- Success means:
  - Invalid extensions are consistently rejected.
  - Size boundary behavior remains stable.
  - Expiration is consistently fixed to 15 minutes.
- Typical failures indicate:
  - Boundary logic regressed.
  - Expiration constant changed unexpectedly.

#### `backend/tests/Unit/Services/SubscriptionServiceUnitTest.php`
- Purpose: Validate subscription service guardrails and status logic without real Stripe calls.
- Success means:
  - Non-company users are rejected for checkout.
  - Status response shape is correct.
  - `canPostJobs` returns `false` for inactive subscriptions.
- Typical failures indicate:
  - Role policy changed.
  - Company profile lookup/status mapping changed.

#### `backend/tests/Unit/Services/SubscriptionServicePropertyTest.php`
- Purpose: Validate internal Stripe status mapping behavior.
- Success means:
  - Mapping outputs remain in the known internal status set.
  - Tier amount constant remains expected.
- Typical failures indicate:
  - Status normalization changed.
  - Business pricing constant changed.

#### `backend/tests/Unit/Services/ProfileServiceUnitTest.php`
- Purpose: Validate profile completion and onboarding service behavior for key edge cases.
- Success means:
  - Applicant completion edge cases (0%/100%) match expected calculations.
  - Company completion reflects required fields and active subscription.
  - Onboarding status reads profile document state correctly.
  - Office image max limit is enforced.
  - Out-of-order onboarding step is rejected.
- Typical failures indicate:
  - Completion formula/weights changed.
  - Onboarding state machine logic changed.
  - Office image max constant or checks changed.

#### `backend/tests/Unit/Services/ProfileServicePropertyTest.php`
- Purpose: Validate invariant rules for social URLs and onboarding/completion properties.
- Success means:
  - LinkedIn/GitHub/portfolio URL rules are enforced.
  - Missing resume prevents full completion.
  - Company out-of-sequence onboarding step is consistently rejected.
- Typical failures indicate:
  - Regex/URL validators changed.
  - Completion requirements changed.
  - Onboarding progression constraints changed.

### Controllers

#### `backend/tests/Unit/Controllers/FileUploadControllerTest.php`
- Purpose: Validate happy-path controller responses for file upload endpoints.
- Success means:
  - `generateUploadUrl` returns expected payload and success metadata.
  - `confirmUpload` returns success confirmation.
- Typical failures indicate:
  - Controller response contract changed.
  - Service interaction or response envelope changed.

#### `backend/tests/Unit/Controllers/FileUploadControllerPropertyTest.php`
- Purpose: Validate repeated invalid-input behavior and response persistence.
- Success means:
  - Invalid type/size cases consistently throw expected service exceptions.
  - `confirmUpload` response preserves `file_url` for each iteration.
- Typical failures indicate:
  - Exception propagation changed.
  - Response payload mapping changed.

#### `backend/tests/Unit/Controllers/SubscriptionControllerTest.php`
- Purpose: Validate subscription endpoint contracts and webhook error handling.
- Success means:
  - Checkout/status/cancel responses match expected JSON shape.
  - Missing webhook secret returns `WEBHOOK_NOT_CONFIGURED`.
  - Invalid webhook signature returns `WEBHOOK_VERIFICATION_FAILED`.
  - Unauthorized checkout error is surfaced correctly.
- Typical failures indicate:
  - Controller exception handling/response schema changed.
  - Webhook signature handling logic changed.

#### `backend/tests/Unit/Controllers/SubscriptionControllerPropertyTest.php`
- Purpose: Validate stable response shape and repeated webhook rejection behavior.
- Success means:
  - Status endpoint always returns keys `tier`, `status`, `can_post_jobs`.
  - Invalid webhook signatures are always rejected.
- Typical failures indicate:
  - Response schema drift.
  - Webhook verification behavior changed.

#### `backend/tests/Unit/Controllers/ProfileControllerTest.php`
- Purpose: Validate applicant-facing profile controller behavior.
- Success means:
  - Applicant profile endpoint returns expected structure.
  - Basic info/skills/resume updates return updated completion payload.
  - Invalid social URLs map to `INVALID_URL`.
  - Office image limit domain error maps to `MAX_IMAGES_EXCEEDED`.
  - Onboarding status endpoint returns expected fields.
- Typical failures indicate:
  - Domain error mapping changed.
  - Response contract or method wiring changed.

#### `backend/tests/Unit/Controllers/ProfileControllerCompanyTest.php`
- Purpose: Validate company-facing profile controller behavior.
- Success means:
  - Company profile endpoint returns expected structure.
  - Company details/logo updates return expected completion/subscription fields.
  - Verification submission path succeeds with valid URLs.
  - Office image missing maps to `OFFICE_IMAGE_NOT_FOUND`.
- Typical failures indicate:
  - Company endpoint response mapping changed.
  - Domain exception handling changed.

#### `backend/tests/Unit/Controllers/OnboardingControllerPropertyTest.php`
- Purpose: Validate onboarding endpoint property behavior.
- Success means:
  - Invalid step requests consistently map to `INVALID_ONBOARDING_STEP`.
  - Onboarding status response shape remains stable.
- Typical failures indicate:
  - Onboarding error mapping or status payload shape changed.

#### `backend/tests/Unit/Controllers/OnboardingControllerUnitTest.php`
- Purpose: Validate explicit onboarding endpoint flows.
- Success means:
  - Applicant step progression response is correct.
  - Company completion response is correct.
  - Invalid step maps to correct API error.
  - Profile completion endpoint returns expected percentage payload.
- Typical failures indicate:
  - Endpoint orchestration around `ProfileService` changed.

#### `backend/tests/Unit/Controllers/HRApplicantReviewUnitTest.php`
- Purpose: Validate HR review request and scoring/completeness helper logic.
- Success means:
  - `HRSwipeRequest` requires `message`.
  - Skill match percentage calculation is accurate.
  - Incomplete profile detection works as expected.
- Typical failures indicate:
  - Validation rules changed.
  - Scoring/completeness helper implementations changed.

### Requests

#### `backend/tests/Unit/Requests/ProfileRequestValidationTest.php`
- Purpose: Validate request rules/authorization for applicant, company, and file upload inputs.
- Success means:
  - Valid payloads pass.
  - Invalid payloads fail the expected fields.
  - Role authorization permits/denies the intended roles.
- Typical failures indicate:
  - FormRequest rules or authorization changed.

### Repositories

#### `backend/tests/Unit/Repositories/CompanyProfileDocumentRepositoryUnitTest.php`
- Purpose: Validate repository contract and in-memory behaviors for company profile docs.
- Success means:
  - CRUD contract signatures/keys are present.
  - `update()` returns fresh model.
  - Office image add/remove operations work by index and URL.
  - Notification preferences merge correctly.
- Typical failures indicate:
  - Repository API surface changed.
  - Array update/reindex behavior changed.

### Exceptions

#### `backend/tests/Unit/Exceptions/ApiExceptionFormatTest.php`
- Purpose: Ensure exception JSON format consistency.
- Success means:
  - `FileUploadException` and `SubscriptionException` render expected status/shape.
  - Property samples maintain common error format keys.
- Typical failures indicate:
  - API error contract changed.

#### `backend/tests/Unit/Exceptions/GlobalExceptionHandlerContractTest.php`
- Purpose: Assert required global exception renderer wiring exists.
- Success means:
  - Validation, not-found, and Stripe API renderer references exist in `bootstrap/app.php`.
- Typical failures indicate:
  - Handler registration moved/renamed/removed.

### Routes

#### `backend/tests/Unit/Routes/ApiRoutesIntegrationTest.php`
- Purpose: Validate API route and middleware declarations via contract checks.
- Success means:
  - Expected route groups/endpoints and role middleware strings are present.
- Typical failures indicate:
  - Route definitions changed, renamed, or moved.

### Existing Baseline Tests

#### `backend/tests/Unit/BugConditionExplorationTest.php`
- Purpose: Validate existence/structure of CI-critical baseline files and classes.
- Success means:
  - `phpunit.xml.dist` and seeder artifacts exist and are valid.
- Typical failures indicate:
  - CI prerequisite files removed or invalid.

#### `backend/tests/Unit/PreservationPropertyTest.php`
- Purpose: Ensure previous baseline behaviors remain intact after changes.
- Success means:
  - Lint/migration/docker/security prerequisites still execute/resolve as expected.
- Typical failures indicate:
  - Environment/tooling drift, missing dependencies, or command regressions.

## Environment Notes
- Most tests are unit/contract style and do not require live Stripe checkout/payment setup.
- Dockerized runs are preferred to avoid host PHP extension mismatches.
- If tests fail before assertions, first verify:
  - Composer dependencies installed in container.
  - PHP extensions (`pdo_pgsql`, `pgsql`, `mongodb`) available in runtime.
  - Laravel config cache cleared when changing env.

## Suggested CI Order
1. `php -l` (syntax gate)
2. Unit tests by category (fast fail)
3. Full unit suite
4. Optional broader integration/e2e checks
