<?php

namespace App\Services;

use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\JobPosting;
use App\Repositories\MongoDB\SwipeHistoryRepository;
use App\Repositories\PostgreSQL\JobPostingRepository;
use App\Repositories\Redis\SwipeCacheRepository;
use Carbon\Carbon;

class DeckService
{
    public function __construct(
        private JobPostingRepository $jobs,
        private SwipeCacheRepository $cache,
        private SwipeHistoryRepository $swipeHistory,
    ) {}

    /**
     * Get the job deck for an applicant with relevance-based sorting
     */
    public function getJobDeck(string $userId, int $perPage = 20): array
    {
        // 1. Get seen job IDs from Redis (fallback to MongoDB)
        $seenJobIds = $this->getSeenJobIds($userId);

        // 2. Get applicant's profile data for skill matching
        $applicantProfile = ApplicantProfileDocument::where('user_id', $userId)->first();
        $applicantSkills = $applicantProfile?->skills ?? [];
        $applicantCity = $applicantProfile?->location_city;

        // 3. Query active jobs excluding seen ones
        $jobs = JobPosting::active()
            ->whereNotIn('id', $seenJobIds)
            ->with(['skills', 'company'])
            ->get();

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

        return [
            'jobs' => $sortedJobs,
            'has_more' => $jobs->count() > $perPage,
            'total_unseen' => $jobs->count(),
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
        // Try to get from Redis first
        $redisKey = "swipe:deck:seen:{$userId}";

        if (\Illuminate\Support\Facades\Redis::exists($redisKey)) {
            return \Illuminate\Support\Facades\Redis::smembers($redisKey);
        }

        // Fallback to MongoDB
        $seenIds = $this->swipeHistory->getSeenJobIds($userId);

        // Rehydrate Redis cache
        if (! empty($seenIds)) {
            $this->cache->refreshDeckSeen($userId, $seenIds);
        }

        return $seenIds;
    }
}
