<?php

namespace App\Services;

use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\JobPosting;
use App\Repositories\MongoDB\SwipeHistoryRepository;
use App\Repositories\Redis\SwipeCacheRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class DeckService
{
    private const CANDIDATE_POOL_MULTIPLIER = 5;

    private const MAX_CANDIDATE_POOL = 250;

    public function __construct(
        private SwipeCacheRepository $cache,
        private SwipeHistoryRepository $swipeHistory,
    ) {}

    /**
     * Get the job deck for an applicant with relevance-based sorting
     */
    public function getJobDeck(string $userId, int $perPage = 20, ?string $cursor = null): array
    {
        $perPage = max(1, min($perPage, 50));

        // 1. Get seen job IDs from Redis (fallback to MongoDB)
        $seenJobIds = $this->getSeenJobIds($userId);

        // 2. Get applicant's profile data for skill matching
        $applicantProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
        $applicantSkills = $applicantProfile?->skills ?? [];
        $applicantCity = $applicantProfile?->location_city;

        $candidateLimit = min(
            max($perPage * self::CANDIDATE_POOL_MULTIPLIER, $perPage),
            self::MAX_CANDIDATE_POOL
        );

        // 3. Query a bounded candidate pool using cursor-based pagination
        $query = JobPosting::active()
            ->whereNotNull('published_at')
            ->whereNotIn('id', $seenJobIds)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->with(['skills', 'company']);

        $decodedCursor = $this->decodeCursor($cursor);
        if ($decodedCursor !== null) {
            $this->applyCursor($query, $decodedCursor['published_at'], $decodedCursor['job_id']);
        }

        $candidatePool = $query
            ->limit($candidateLimit + 1)
            ->get();

        $hasMore = $candidatePool->count() > $candidateLimit;
        $jobs = $candidatePool->take($candidateLimit)->values();

        // 4. Calculate relevance score for each job
        $scoredJobs = $jobs->map(function ($job) use ($applicantSkills, $applicantCity) {
            $skillScore = $this->calculateSkillMatch($job, $applicantSkills);
            $recencyScore = $this->calculateRecencyScore($job);
            $locationBonus = $this->calculateLocationBonus($job, $applicantCity);
            $remoteBonus = $job->work_type === 'remote' ? 0.05 : 0;

            $job->relevance_score = ($skillScore * 0.7) + ($recencyScore * 0.3) + $locationBonus + $remoteBonus;

            return $job;
        });

        // 5. Sort by relevance score and paginate
        $sortedJobs = $scoredJobs->sortByDesc('relevance_score')->take($perPage)->values();

        $nextCursor = null;
        if ($hasMore && $jobs->isNotEmpty()) {
            $nextCursor = $this->encodeCursor($jobs->last());
        }

        $totalUnseen = JobPosting::active()
            ->whereNotNull('published_at')
            ->whereNotIn('id', $seenJobIds)
            ->count();

        return [
            'jobs' => $sortedJobs,
            'has_more' => $hasMore,
            'total_unseen' => $totalUnseen,
            'next_cursor' => $nextCursor,
        ];
    }

    /**
     * Calculate skill match score between job requirements and applicant skills
     */
    private function calculateSkillMatch(JobPosting $job, array $applicantSkills): float
    {
        if (empty($applicantSkills) || $job->skills->isEmpty()) {
            return 0.0;
        }

        $jobSkillNames = $job->skills->pluck('skill_name')->map(fn ($s) => strtolower($s))->toArray();
        $applicantSkillNames = collect($applicantSkills)->pluck('name')->map(fn ($s) => strtolower($s))->toArray();

        $matchedSkills = array_intersect($jobSkillNames, $applicantSkillNames);
        $matchCount = count($matchedSkills);
        $totalJobSkills = count($jobSkillNames);

        if ($totalJobSkills === 0) {
            return 0.0;
        }

        // Return percentage of matched skills (0.0 to 1.0)
        return $matchCount / $totalJobSkills;
    }

    /**
     * Calculate recency score based on publication date
     */
    private function calculateRecencyScore(JobPosting $job): float
    {
        if (! $job->published_at) {
            return 0.4; // Default for unpublished/draft
        }

        $daysAgo = Carbon::now()->diffInDays($job->published_at);

        return match (true) {
            $daysAgo < 7 => 1.0,
            $daysAgo < 14 => 0.8,
            $daysAgo < 30 => 0.6,
            default => 0.4,
        };
    }

    /**
     * Calculate location bonus if job is in same city
     */
    private function calculateLocationBonus(JobPosting $job, ?string $applicantCity): float
    {
        if (! $applicantCity || ! $job->location_city) {
            return 0.0;
        }

        return strtolower($job->location_city) === strtolower($applicantCity) ? 0.1 : 0.0;
    }

    /**
     * Get seen job IDs with Redis cache and MongoDB fallback
     */
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

    private function applyCursor(Builder $query, Carbon $publishedAt, string $jobId): void
    {
        $query->where(function (Builder $builder) use ($publishedAt, $jobId) {
            $builder->where('published_at', '<', $publishedAt)
                ->orWhere(function (Builder $inner) use ($publishedAt, $jobId) {
                    $inner->where('published_at', '=', $publishedAt)
                        ->where('id', '<', $jobId);
                });
        });
    }

    private function decodeCursor(?string $cursor): ?array
    {
        if ($cursor === null || trim($cursor) === '') {
            return null;
        }

        $decoded = base64_decode($cursor, true);

        if ($decoded === false) {
            return null;
        }

        $data = json_decode($decoded, true);

        if (! is_array($data) || ! isset($data['published_at'], $data['job_id'])) {
            return null;
        }

        try {
            $publishedAt = Carbon::parse((string) $data['published_at']);
        } catch (\Throwable) {
            return null;
        }

        $jobId = (string) $data['job_id'];
        if ($jobId === '') {
            return null;
        }

        return [
            'published_at' => $publishedAt,
            'job_id' => $jobId,
        ];
    }

    private function encodeCursor(JobPosting $job): string
    {
        $publishedAt = $job->published_at?->toIso8601String();

        return base64_encode((string) json_encode([
            'published_at' => $publishedAt,
            'job_id' => (string) $job->id,
        ]));
    }
}
