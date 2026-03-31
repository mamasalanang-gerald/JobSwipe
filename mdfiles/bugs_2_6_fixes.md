# Bugs 2-6 Fixes

This document provides code fixes for bugs 2-6 identified in the backend analysis report.

---

## Bug 2: Transaction Doesn't Cover Both Databases

**Location:** `SwipeService::applicantSwipeRight()`  
**File:** `backend/app/Services/SwipeService.php` (lines 37-55)

**Problem:** The `DB::transaction()` only wraps PostgreSQL operations. MongoDB writes inside the transaction are not atomic — if PostgreSQL fails and rolls back, the MongoDB document persists, creating data inconsistency.

**Fix:** Move MongoDB write outside the transaction and handle rollback manually if PostgreSQL fails.

```php
public function applicantSwipeRight(string $userId, string $jobId): array
{
    $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();

    // 1. Enforce daily swipe limit
    if (! $this->hasSwipesRemaining($applicant)) {
        return ['status' => 'limit_reached'];
    }

    // 2. Deduplication — Redis first, MongoDB fallback
    if ($this->hasAlreadySwiped($userId, $jobId, 'job_posting')) {
        return ['status' => 'already_swiped'];
    }

    // 3. Write to MongoDB first (outside transaction)
    $swipeDoc = $this->swipeHistory->recordSwipe([
        'user_id' => $userId,
        'actor_type' => 'applicant',
        'direction' => 'right',
        'target_id' => $jobId,
        'target_type' => 'job_posting',
        'job_posting_id' => null,
        'meta' => [
            'subscription_tier' => $applicant->subscription_tier,
            'daily_swipe_count_at_time' => $this->cache->getCounter($userId) ?? 0,
        ],
    ]);

    // 4. Write to PostgreSQL in transaction
    try {
        DB::transaction(function () use ($applicant, $jobId) {
            $this->applications->create($applicant->id, $jobId);
            $applicant->increment('daily_swipes_used');
        });
    } catch (\Throwable $e) {
        // Rollback MongoDB write if PostgreSQL fails
        if ($swipeDoc && $swipeDoc->_id) {
            $this->swipeHistory->deleteById($swipeDoc->_id);
        }
        throw $e;
    }

    // 5. Update Redis cache
    $this->cache->markJobSeen($userId, $jobId);
    $this->cache->incrementCounter($userId);

    return ['status' => 'applied'];
}
```

**What it fixes:** Ensures data consistency between MongoDB and PostgreSQL by handling rollback manually when PostgreSQL operations fail.

**Required:** Add `deleteById()` method to `SwipeHistoryRepository`:

```php
// In SwipeHistoryRepository.php

public function deleteById(string $id): bool
{
    return SwipeHistory::where('_id', $id)->delete();
}
```

---

## Bug 3: Left Swipe Doesn't Use a Transaction

**Location:** `SwipeService::applicantSwipeLeft()`  
**File:** `backend/app/Services/SwipeService.php` (lines 80-96)

**Problem:** MongoDB write and PostgreSQL `increment()` are not wrapped in any transaction. If `increment()` fails, MongoDB has the swipe record but the counter isn't updated.

**Fix:** Wrap PostgreSQL operations in a transaction and handle MongoDB rollback on failure.

```php
public function applicantSwipeLeft(string $userId, string $jobId): array
{
    $applicant = ApplicantProfile::where('user_id', $userId)->firstOrFail();

    // 1. Enforce daily swipe limit
    if (! $this->hasSwipesRemaining($applicant)) {
        return ['status' => 'limit_reached'];
    }

    // 2. Deduplication check
    if ($this->hasAlreadySwiped($userId, $jobId, 'job_posting')) {
        return ['status' => 'already_swiped'];
    }

    // 3. Write to MongoDB first
    $swipeDoc = $this->swipeHistory->recordSwipe([
        'user_id' => $userId,
        'actor_type' => 'applicant',
        'direction' => 'left',
        'target_id' => $jobId,
        'target_type' => 'job_posting',
        'job_posting_id' => null,
        'meta' => ['subscription_tier' => $applicant->subscription_tier],
    ]);

    // 4. Update PostgreSQL counter in transaction
    try {
        DB::transaction(function () use ($applicant) {
            $applicant->increment('daily_swipes_used');
        });
    } catch (\Throwable $e) {
        // Rollback MongoDB write if PostgreSQL fails
        if ($swipeDoc && $swipeDoc->_id) {
            $this->swipeHistory->deleteById($swipeDoc->_id);
        }
        throw $e;
    }

    // 5. Update Redis cache
    $this->cache->markJobSeen($userId, $jobId);
    $this->cache->incrementCounter($userId);

    return ['status' => 'dismissed'];
}
```

**What it fixes:** Ensures MongoDB and PostgreSQL stay consistent by wrapping PostgreSQL operations in a transaction and rolling back MongoDB on failure.

**Required:** Same `deleteById()` method needed in `SwipeHistoryRepository` (see Bug 2).

---

## Bug 4: `Redis::keys()` in Production — Performance Bomb

**Location:** `ResetDailySwipesJob::handle()` and `UserDataCleanupService::cleanupForDeletedUser()`  
**Files:**
- `backend/app/Jobs/ResetDailySwipesJob.php` (lines 29-33)
- `backend/app/Services/UserDataCleanupService.php` (lines 38-45)

**Problem:** `Redis::keys()` is an O(N) blocking command that scans the entire Redis keyspace. In production, this can block Redis for seconds, causing cascading timeouts.

### Fix 1: ResetDailySwipesJob

**Option A (Recommended):** Remove the Redis cleanup entirely — counter keys already have TTL and expire at midnight PHT.

```php
public function handle(): void
{
    // Reset all applicant daily_swipes_used to 0
    ApplicantProfile::query()->update([
        'daily_swipes_used' => 0,
        'swipe_reset_at' => now()->toDateString(),
    ]);

    // Redis counters auto-expire via TTL — no manual cleanup needed

    \Log::info('Daily swipes reset completed', [
        'reset_at' => now()->toDateTimeString(),
    ]);
}
```

**Option B:** Use `SCAN` instead of `KEYS` for non-blocking iteration.

```php
public function handle(): void
{
    ApplicantProfile::query()->update([
        'daily_swipes_used' => 0,
        'swipe_reset_at' => now()->toDateString(),
    ]);

    // Use SCAN instead of KEYS for non-blocking cleanup
    $cursor = 0;
    do {
        [$cursor, $keys] = Redis::scan($cursor, ['MATCH' => 'swipe:counter:*', 'COUNT' => 100]);
        if (!empty($keys)) {
            Redis::del(...$keys);
        }
    } while ($cursor !== 0);

    \Log::info('Daily swipes reset completed', [
        'reset_at' => now()->toDateTimeString(),
    ]);
}
```

### Fix 2: UserDataCleanupService

Replace `Redis::keys()` with `SCAN` for both cleanup operations:

```php
public function cleanupForDeletedUser(User $user): void
{
    $companyId = CompanyProfile::query()
        ->where('user_id', $user->id)
        ->value('id');

    ApplicantProfileDocument::where('user_id', $user->id)->delete();

    CompanyProfileDocument::where('user_id', $user->id)->delete();
    if (is_string($companyId) && $companyId !== '') {
        CompanyProfileDocument::where('company_id', $companyId)->delete();
    }

    SwipeHistory::where('user_id', $user->id)
        ->orWhere('target_id', $user->id)
        ->delete();

    $this->otpCache->delete($user->email);

    Redis::del("swipe:deck:seen:{$user->id}");

    // Use SCAN instead of KEYS for counter cleanup
    $this->scanAndDelete("swipe:counter:{$user->id}:*");

    // Use SCAN instead of KEYS for HR seen cleanup
    $this->scanAndDelete("swipe:hr:seen:{$user->id}:*");

    Redis::del("points:{$user->id}");
}

private function scanAndDelete(string $pattern): void
{
    $cursor = 0;
    do {
        [$cursor, $keys] = Redis::scan($cursor, ['MATCH' => $pattern, 'COUNT' => 100]);
        if (!empty($keys)) {
            Redis::del(...$keys);
        }
    } while ($cursor !== 0);
}
```

**What it fixes:** Prevents Redis from blocking on large keyspace scans, avoiding production performance degradation and timeouts.

---

## Bug 5: `DeckService::getSeenJobIds()` Uses Raw Redis Facade

**Location:** `DeckService::getSeenJobIds()`  
**File:** `backend/app/Services/DeckService.php` (lines 157-161)

**Problem:** Bypasses the injected `SwipeCacheRepository` and calls Redis facade directly. Also has a TOCTOU race condition — between `exists()` and `smembers()`, the key could expire.

**Fix:** Use the repository abstraction and eliminate the race condition.

```php
private function getSeenJobIds(string $userId): array
{
    // Use repository method instead of raw Redis facade
    $seenIds = $this->cache->getSeenJobs($userId);

    // If cache miss, fallback to MongoDB
    if ($seenIds === null || empty($seenIds)) {
        $seenIds = $this->swipeHistory->getSeenJobIds($userId);

        // Rehydrate Redis cache
        if (! empty($seenIds)) {
            $this->cache->refreshDeckSeen($userId, $seenIds);
        }
    }

    return $seenIds;
}
```

**Required:** Add `getSeenJobs()` method to `SwipeCacheRepository`:

```php
// In SwipeCacheRepository.php

public function getSeenJobs(string $userId): ?array
{
    $redisKey = "swipe:deck:seen:{$userId}";
    
    // smembers returns empty array if key doesn't exist, no race condition
    $members = Redis::smembers($redisKey);
    
    return $members !== false ? $members : null;
}
```

**What it fixes:** Maintains repository abstraction, eliminates TOCTOU race condition, and makes the code more testable.

---

## Bug 6: `getPending()` Queries for Non-Existent Status

**Location:** `ApplicationRepository::getPending()`  
**File:** `backend/app/Repositories/PostgreSQL/ApplicationRepository.php` (lines 97-103)

**Problem:** Queries for `status = 'pending'`, but the `applications.status` enum only has `('applied', 'invited', 'dismissed')`. This method always returns an empty collection.

**Fix:** Change to query for `'applied'` status instead.

```php
public function getPending(string $jobPostingId): Collection
{
    return Application::where('job_posting_id', $jobPostingId)
        ->where('status', 'applied')
        ->with('applicant.user')
        ->get();
}
```

**What it fixes:** Makes the method return actual pending applications (those with `'applied'` status) instead of always returning empty results.

---

## Summary

| Bug | Severity | Fix Complexity | Impact | Dependencies |
|-----|----------|----------------|---------|--------------|
| Bug 2 | High | Medium | Prevents data inconsistency between MongoDB and PostgreSQL | Requires `deleteById()` in SwipeHistoryRepository |
| Bug 3 | High | Medium | Prevents data inconsistency in left swipe operations | Requires `deleteById()` in SwipeHistoryRepository |
| Bug 4 | Critical | Low | Prevents Redis blocking and production performance issues | None (Option A) |
| Bug 5 | Medium | Low | Maintains abstraction and eliminates race condition | Requires `getSeenJobs()` in SwipeCacheRepository |
| Bug 6 | Medium | Trivial | Makes getPending() actually work | None |

All fixes are minimal, focused, and avoid overengineering. They address the root cause without introducing unnecessary complexity.

---

## Implementation Order

1. **Bug 6** - Deploy immediately (1-line change, zero dependencies)
2. **Bug 4** - Deploy immediately (use Option A for ResetDailySwipesJob, SCAN for UserDataCleanupService)
3. **Bug 5** - Add `getSeenJobs()` method to SwipeCacheRepository, then deploy
4. **Bugs 2 & 3** - Add `deleteById()` method to SwipeHistoryRepository, then deploy both together

---

## Code Review Notes

✅ **Bug 4 & Bug 6**: Ready to implement immediately  
⚠️ **Bugs 2, 3, 5**: Require new repository methods before deployment  
✅ All fixes follow Laravel 11 conventions and maintain existing architecture patterns
