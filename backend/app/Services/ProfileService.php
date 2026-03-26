<?php

namespace App\Services;

use App\Models\PostgreSQL\User;
use App\Repositories\MongoDB\ApplicantProfileDocumentRepository;
use App\Repositories\PostgreSQL\ApplicantProfileRepository;
use App\Repositories\PostgreSQL\CompanyProfileRepository;

class ProfileService
{
    public function __construct(
        private ApplicantProfileRepository $applicantProfiles,
        private CompanyProfileRepository $companyProfiles,
        private ApplicantProfileDocumentRepository $applicantDocs,
        private PointService $points,
    ) {}

    public function createProfileForUser(User $user, ?string $avatarUrl = null): void
    {
        match ($user->role) {
            'applicant' => $this->createApplicantProfile($user, $avatarUrl),
            'hr', 'company_admin' => $this->createCompanyProfile($user),
            default => null,
        };
    }

    private function createApplicantProfile(User $user, ?string $avatarUrl): void
    {
        // PostgreSQL: Subscription and swipe tracking
        $this->applicantProfiles->create([
            'user_id' => $user->id,
            'subscription_tier' => 'free',
            'subscription_status' => 'inactive',
            'total_points' => 0,
            'daily_swipes_used' => 0,
            'daily_swipe_limit' => 15,
            'extra_swipes_balance' => 0,
        ]);

        // MongoDB: Rich profile data
        $this->applicantDocs->create([
            'user_id' => $user->id,
            'first_name' => '',
            'last_name' => '',
            'profile_photo_url' => $avatarUrl,
            'skills' => [],
            'work_experience' => [],
            'education' => [],
            'social_links' => [],
            'completed_profile_fields' => [],
        ]);
    }

    private function createCompanyProfile(User $user): void
    {
        $this->companyProfiles->create([
            'user_id' => $user->id,
            'company_name' => '',
            'is_verified' => false,
            'verification_status' => 'pending',
            'subscription_tier' => 'free',
            'subscription_status' => 'inactive',
            'active_listings_count' => 0,
        ]);
    }

    public function updateApplicantPhoto(string $userId, string $photoUrl): void
    {
        $profileDoc = $this->applicantDocs->findByUserId($userId);

        if ($profileDoc && empty($profileDoc->profile_photo_url)) {
            $this->applicantDocs->update($profileDoc, ['profile_photo_url' => $photoUrl]);
        }
    }

    public function updateApplicantProfile(string $userId, array $data): void
    {
        $applicant = $this->applicantProfiles->findByUserId($userId);
        $mongoProfile = $this->applicantDocs->findByUserId($userId);

        // Track what changed for point awards
        $changes = [];

        if (isset($data['bio']) && empty($mongoProfile->bio)) {
            $changes[] = 'bio_added';
        }

        if (isset($data['linkedin_url']) && empty($mongoProfile->linkedin_url)) {
            $changes[] = 'linkedin_linked';
        }

        if (isset($data['skills']) && count($data['skills']) >= 3 && count($mongoProfile->skills ?? []) < 3) {
            $changes[] = 'skills_added';
        }

        // Update MongoDB via repository
        $this->applicantDocs->update($mongoProfile, $data);

        // Award points for new completions
        foreach ($changes as $eventType) {
            $this->points->awardPoints($applicant->id, $eventType);
        }
    }
}
