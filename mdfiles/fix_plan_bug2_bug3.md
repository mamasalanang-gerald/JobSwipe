# Fix Plan — Bug 2 & Bug 3 in `SwipeService.php`

> **Target file:** [SwipeService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php)  
> **Related files:**  
> - [SwipeHistoryRepository.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Repositories/MongoDB/SwipeHistoryRepository.php)  
> - [ApplicationRepository.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Repositories/PostgreSQL/ApplicationRepository.php)  
> - [SwipeCacheRepository.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Repositories/Redis/SwipeCacheRepository.php)

---

## Problem Summary

| Bug | Method | Issue |
|-----|--------|-------|
| **Bug 2** | `applicantSwipeRight()` (L37-55) | `DB::transaction()` wraps both a MongoDB write and PostgreSQL writes, but only PostgreSQL is transactional. If PG fails and rolls back, the MongoDB document persists → **data inconsistency** (orphaned swipe history). |
| **Bug 3** | `applicantSwipeLeft()` (L80-96) | MongoDB write + PG `increment('daily_swipes_used')` are completely **unwrapped** — if either fails, the other still commits → **counter drift** or **phantom swipes**. |

> [!IMPORTANT]
> MongoDB does **not** participate in Laravel's `DB::transaction()`. The `DB` facade only manages the default PostgreSQL connection. Any MongoDB writes inside a `DB::transaction()` block execute immediately and are **never rolled back**, even if the PG transaction fails.

---

## Strategy: Write-Order + Compensation

Since true cross-database 2PC (two-phase commit) is impractical here, we use **ordered writes + try/catch compensation**:

1. **Write to PostgreSQL first** (inside a real transaction) — this is the authoritative store.
2. **Then write to MongoDB** — the audit/history store.
3. If the MongoDB write fails, **roll back the PostgreSQL transaction** by re-throwing inside the transaction closure, or compensate manually if PG already committed.

This ensures the **source of truth (PostgreSQL) is never dirty**, and MongoDB inconsistencies are detectable/recoverable.

---

## Step-by-Step Changes

### Step 1 — Fix `applicantSwipeRight()` (Bug 2)

**Current code (L37-55):**
```php
DB::transaction(function () use ($userId, $applicant, $jobId) {
    $this->swipeHistory->recordSwipe([...]); // ← MongoDB (NOT transactional)
    $this->applications->create(...);        // ← PostgreSQL
    $applicant->increment('daily_swipes_used'); // ← PostgreSQL
});
```

**Fixed code — move MongoDB write outside and after PG transaction:**
```php
// 3a. PostgreSQL writes (transactional)
DB::transaction(function () use ($applicant, $jobId) {
    $this->applications->create($applicant->id, $jobId);
    $applicant->increment('daily_swipes_used');
});

// 3b. MongoDB audit trail (non-transactional, best-effort)
try {
    $this->swipeHistory->recordSwipe([
        'user_id'        => $userId,
        'actor_type'     => 'applicant',
        'direction'      => 'right',
        'target_id'      => $jobId,
        'target_type'    => 'job_posting',
        'job_posting_id' => null,
        'meta'           => [
            'subscription_tier'       => $applicant->subscription_tier,
            'daily_swipe_count_at_time' => $this->cache->getCounter($userId) ?? 0,
        ],
    ]);
} catch (\Throwable $e) {
    // Log failure — PG is already committed and correct.
    // MongoDB can be reconciled later from the applications table.
    \Log::error('MongoDB swipe history write failed for right swipe', [
        'user_id' => $userId,
        'job_id'  => $jobId,
        'error'   => $e->getMessage(),
    ]);
}
```

> [!NOTE]
> **Why PG first?** The `applications` table is the business-critical record (it drives the HR review queue). MongoDB swipe history is an audit/analytics trail — a missing record there is recoverable. A missing application is not.

---

### Step 2 — Fix `applicantSwipeLeft()` (Bug 3)

**Current code (L80-96):**
```php
// No transaction at all
$this->swipeHistory->recordSwipe([...]); // MongoDB
$applicant->increment('daily_swipes_used'); // PostgreSQL
```

**Fixed code — wrap PG in a transaction, MongoDB after:**
```php
// 3a. PostgreSQL write (transactional)
DB::transaction(function () use ($applicant) {
    $applicant->increment('daily_swipes_used');
});

// 3b. MongoDB audit trail (non-transactional, best-effort)
try {
    $this->swipeHistory->recordSwipe([
        'user_id'        => $userId,
        'actor_type'     => 'applicant',
        'direction'      => 'left',
        'target_id'      => $jobId,
        'target_type'    => 'job_posting',
        'job_posting_id' => null,
        'meta'           => ['subscription_tier' => $applicant->subscription_tier],
    ]);
} catch (\Throwable $e) {
    \Log::error('MongoDB swipe history write failed for left swipe', [
        'user_id' => $userId,
        'job_id'  => $jobId,
        'error'   => $e->getMessage(),
    ]);
}
```

> [!TIP]
> Since `applicantSwipeLeft` only has a single PG statement (`increment`), the `DB::transaction()` wrapper is technically optional for atomicity. However, wrapping it is still good practice for consistency with the right-swipe path and future-proofing (if more PG writes get added later).

---

### Step 3 — Apply the same pattern to `hrSwipeRight()` (L111-123)

`hrSwipeRight()` has the **exact same Bug 2 pattern** — MongoDB write inside `DB::transaction()`:

```php
DB::transaction(function () use ($hrUserId, $jobId, $applicantId, $message) {
    $this->swipeHistory->recordSwipe([...]); // ← MongoDB, not transactional!
    $this->applications->markInvited(...);   // ← PostgreSQL
});
```

**Apply the same fix:** PG transaction first, MongoDB after with try/catch.

---

### Step 4 — No changes needed for `hrSwipeLeft()` (L136-158)

`hrSwipeLeft()` only writes to MongoDB (no PG writes), so there's no cross-database consistency issue. No changes needed.

---

## Summary of All Changes

| Method | What changes | Lines affected |
|--------|-------------|----------------|
| `applicantSwipeRight()` | Move MongoDB `recordSwipe()` outside `DB::transaction()`, add try/catch | L37-55 |
| `applicantSwipeLeft()` | Wrap `increment()` in `DB::transaction()`, move MongoDB write to try/catch | L80-96 |
| `hrSwipeRight()` | Move MongoDB `recordSwipe()` outside `DB::transaction()`, add try/catch | L111-123 |

All changes are in a **single file**: [SwipeService.php](file:///f:/Dev%20Shit/JobSwipe/JobSwipe/backend/app/Services/SwipeService.php)

---

## Testing Checklist

- [ ] **Happy path** — swipe right/left as applicant, verify both PG and Mongo records exist
- [ ] **PG failure simulation** — e.g. duplicate application insert → confirm MongoDB does NOT have an orphaned record
- [ ] **MongoDB failure simulation** — kill MongoDB connection → confirm PG records are still committed and error is logged
- [ ] **Deduplication still works** — swipe the same job twice → second attempt returns `already_swiped`
- [ ] **Daily limit enforcement** — exhaust daily swipes → verify `limit_reached` response
- [ ] **HR invite flow** — HR swipes right → application status updates to `invited`, MongoDB has audit entry

---

> [!WARNING]
> **The `hrSwipeRight()` method has the same bug** as `applicantSwipeRight()`. While the report only flagged Bug 2 and 3 explicitly, fixing `hrSwipeRight()` in the same pass prevents the identical inconsistency on the HR side.
