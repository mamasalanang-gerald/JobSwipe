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
            'extra_swipe_balance' => 0,
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
}
