<?php

namespace App\Services;

use App\Jobs\SendMatchNotification;
use App\Models\PostgreSQL\ApplicantProfile;
use App\Repositories\MongoDB\SwipeHistoryRepository;
use App\Repositories\PostgreSQL\ApplicationRepository;
use App\Repositories\Redis\SwipeCacheRepository;
use Illuminate\Support\Facades\DB;

class SwipeService
{
    public function __construct(
        private SwipeCacheRepository $cache,
        private SwipeHistoryRepository $swipeHistory,
        private ApplicationRepository $applications,
    ) {}

    // ── Applicant swipes right on a job ────────────────────────────────────

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

        // MongoDB Write

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

        try {
            DB::transaction(function () use ($applicant, $userId, $jobId) {
                $this->applications->create($applicant->id, $jobId);
                $this->consumeApplicantSwipe($applicant);
                $this->markJobSeenInPostgres($userId, $jobId);
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

    // ── Applicant swipes left on a job ─────────────────────────────────────

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
            DB::transaction(function () use ($applicant, $userId, $jobId) {
                $this->consumeApplicantSwipe($applicant);
                $this->markJobSeenInPostgres($userId, $jobId);
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

    // ── HR swipes right on an applicant (sends invitation) ─────────────────

    public function hrSwipeRight(string $hrUserId, string $jobId, string $applicantId, string $message): array
    {
        // 1. Deduplication check
        if ($this->hasHrAlreadySwiped($hrUserId, $jobId, $applicantId)) {
            return ['status' => 'already_swiped'];
        }

        if (! $this->applications->exists($applicantId, $jobId)) {
            return ['status' => 'application_not_found'];
        }

        // 2. Write to MongoDB first, then update PostgreSQL
        $swipeDoc = $this->swipeHistory->recordSwipe([
            'user_id' => $hrUserId,
            'actor_type' => 'hr',
            'direction' => 'right',
            'target_id' => $applicantId,
            'target_type' => 'applicant',
            'job_posting_id' => $jobId,
            'meta' => [],
        ]);

        try {
            DB::transaction(function () use ($applicantId, $jobId, $message) {
                $updated = $this->applications->markInvited($applicantId, $jobId, $message);

                if ($updated < 1) {
                    throw new \RuntimeException('APPLICATION_NOT_FOUND');
                }
            });
        } catch (\RuntimeException $e) {
            if ($swipeDoc && $swipeDoc->_id) {
                $this->swipeHistory->deleteById($swipeDoc->_id);
            }

            if ($e->getMessage() === 'APPLICATION_NOT_FOUND') {
                return ['status' => 'application_not_found'];
            }

            throw $e;
        } catch (\Throwable $e) {
            if ($swipeDoc && $swipeDoc->_id) {
                $this->swipeHistory->deleteById($swipeDoc->_id);
            }

            throw $e;
        }

        // 3. Update Redis cache
        $this->cache->markApplicantSeenByHr($hrUserId, $jobId, $applicantId);

        // Dispatch match notification job
        SendMatchNotification::dispatch($applicantId, $jobId)->onQueue('notifications');

        return ['status' => 'invited'];
    }

    // ── HR swipes left on an applicant ─────────────────────────────────────

    public function hrSwipeLeft(string $hrUserId, string $jobId, string $applicantId): array
    {
        // 1. Deduplication check
        if ($this->hasHrAlreadySwiped($hrUserId, $jobId, $applicantId)) {
            return ['status' => 'already_swiped'];
        }

        // 2. Write to MongoDB only (no PostgreSQL update needed for dismissals)
        $this->swipeHistory->recordSwipe([
            'user_id' => $hrUserId,
            'actor_type' => 'hr',
            'direction' => 'left',
            'target_id' => $applicantId,
            'target_type' => 'applicant',
            'job_posting_id' => $jobId,
            'meta' => [],
        ]);

        // 3. Update Redis cache
        $this->cache->markApplicantSeenByHr($hrUserId, $jobId, $applicantId);

        return ['status' => 'dismissed'];
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private function hasSwipesRemaining(ApplicantProfile $applicant): bool
    {
        // Check if within daily limit or has extra swipes
        if ($applicant->daily_swipes_used < $applicant->daily_swipe_limit) {
            return true;
        }

        // Check extra swipes balance
        if ($applicant->extra_swipe_balance > 0) {
            return true;
        }

        return false;
    }

    private function consumeApplicantSwipe(ApplicantProfile $applicant): void
    {
        // Consume daily swipes first, then fallback to paid extra swipes.
        if ($applicant->daily_swipes_used < $applicant->daily_swipe_limit) {
            $applicant->increment('daily_swipes_used');

            return;
        }

        if ($applicant->extra_swipe_balance > 0) {
            $applicant->decrement('extra_swipe_balance');
        }
    }

    private function hasAlreadySwiped(string $userId, string $targetId, string $targetType): bool
    {
        // Try Redis first
        $cached = $this->cache->hasSeenJob($userId, $targetId);

        if ($cached !== null) {
            return $cached;
        }

        // Fallback to MongoDB
        $exists = $this->swipeHistory->hasSwipedOn($userId, $targetId, $targetType);

        // Rehydrate Redis cache if MongoDB had the data
        if ($exists) {
            $this->cache->markJobSeen($userId, $targetId);
            $this->markJobSeenInPostgres($userId, $targetId);
        }

        return $exists;
    }

    private function markJobSeenInPostgres(string $userId, string $jobId): void
    {
        $timestamp = now();

        DB::connection('pgsql')
            ->table('applicant_seen_jobs')
            ->upsert(
                [[
                    'user_id' => $userId,
                    'job_id' => $jobId,
                    'seen_at' => $timestamp,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]],
                ['user_id', 'job_id'],
                ['seen_at', 'updated_at']
            );
    }

    private function hasHrAlreadySwiped(string $hrUserId, string $jobId, string $applicantId): bool
    {
        // Try Redis first
        $cached = $this->cache->hasSeenApplicant($hrUserId, $jobId, $applicantId);

        if ($cached !== null) {
            return $cached;
        }

        // Fallback to MongoDB
        $exists = $this->swipeHistory->hasHrSwipedOn($hrUserId, $jobId, $applicantId);

        // Rehydrate Redis cache if MongoDB had the data
        if ($exists) {
            $this->cache->markApplicantSeenByHr($hrUserId, $jobId, $applicantId);
        }

        return $exists;
    }
}
