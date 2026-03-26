<?php

namespace App\Services;

use App\Repositories\PostgreSQL\ApplicantProfileRepository;
use App\Repositories\PostgreSQL\PointEventRepository;
use App\Repositories\Redis\SwipeCacheRepository;

class PointService
{
    public function __construct(
        private PointEventRepository $pointEvents,
        private ApplicantProfileRepository $applicantProfiles,
        private SwipeCacheRepository $cache,
    ) {}

    public function awardPoints(string $applicantId, string $eventType, ?string $description = null): int
    {
        $pointsMap = [
            'resume_uploaded' => 30,
            'bio_added' => 10,
            'profile_photo_uploaded' => 10,
            'linkedin_linked' => 20,
            'social_linked' => 5,
            'skills_added' => 15,
            'cover_letter_uploaded' => 15,
            'portfolio_uploaded' => 20,
            'subscribed_basic' => 25,
            'subscribed_pro' => 50,
            'bonus_pro' => 10,
        ];

        $points = $pointsMap[$eventType] ?? 0;

        try {
            // Create point event (will fail if duplicate one-time event due to unique index)
            $this->pointEvents->create([
                'applicant_id' => $applicantId,
                'event_type' => $eventType,
                'points' => $points,
                'description' => $description,
            ]);

            // Recalculate total points
            return $this->recalculatePoints($applicantId);
        } catch (\Exception $e) {
            // Duplicate event, return current points
            return $this->getPoints($applicantId);
        }
    }

    public function recalculatePoints(string $applicantId): int
    {
        $totalPoints = $this->pointEvents->getTotalPoints($applicantId);

        // Update PostgreSQL via repository
        $applicant = $this->applicantProfiles->findById($applicantId);
        $this->applicantProfiles->update($applicant, ['total_points' => $totalPoints]);

        // Update Redis cache
        $this->cache->setPoints($applicantId, $totalPoints);

        return $totalPoints;
    }

    public function getPoints(string $applicantId): int
    {
        // Try Redis first
        $cached = $this->cache->getPoints($applicantId);
        if ($cached !== null) {
            return $cached;
        }

        // Fallback to PostgreSQL via repository
        $applicant = $this->applicantProfiles->findById($applicantId);
        $this->cache->setPoints($applicantId, $applicant->total_points);

        return $applicant->total_points;
    }

    public function getPointHistory(string $applicantId): array
    {
        return $this->pointEvents->getHistory($applicantId)->toArray();
    }
}
