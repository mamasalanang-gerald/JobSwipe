<?php

namespace App\Services;

use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\MongoDB\CompanyProfileDocument;
use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\User;
use App\Repositories\MongoDB\ApplicantProfileDocumentRepository;
use App\Repositories\MongoDB\CompanyProfileDocumentRepository;
use App\Repositories\PostgreSQL\ApplicantProfileRepository;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use InvalidArgumentException;

class ProfileService
{
    public const APPLICANT_ONBOARDING_STEPS = 6;

    public const COMPANY_ONBOARDING_STEPS = 4;

    public const MAX_OFFICE_IMAGES = 6;

    public function __construct(
        private ApplicantProfileRepository $applicantProfiles,
        private CompanyProfileRepository $companyProfiles,
        private ApplicantProfileDocumentRepository $applicantDocs,
        private CompanyProfileDocumentRepository $companyDocs,
        private PointService $points,
        ?ProfileCompletionService $completion = null,
        ?ProfileOnboardingService $onboarding = null,
        ?ProfileSocialLinksValidator $socialLinksValidator = null,
    ) {
        $this->completion = $completion ?? new ProfileCompletionService;
        $this->socialLinksValidator = $socialLinksValidator ?? new ProfileSocialLinksValidator;
        $this->onboarding = $onboarding ?? new ProfileOnboardingService(
            $this->applicantDocs,
            $this->companyDocs,
            $this->companyProfiles,
            $this->completion,
            $this->socialLinksValidator,
        );
    }

    private ProfileCompletionService $completion;

    private ProfileOnboardingService $onboarding;

    private ProfileSocialLinksValidator $socialLinksValidator;

    public function createProfileForUser(User $user, ?string $avatarUrl = null): void
    {
        match ($user->role) {
            'applicant' => $this->createApplicantProfile($user, $avatarUrl),
            'hr', 'company_admin' => $this->createCompanyProfile($user),
            default => null,
        };
    }

    public function getApplicantProfile(string $userId): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $completion = $this->calculateApplicantCompletion($profile);

        return [
            'profile' => $profile,
            'profile_completion_percentage' => $completion,
        ];
    }

    public function updateApplicantBasicInfo(string $userId, array $data): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $allowed = array_intersect_key($data, array_flip([
            'first_name',
            'last_name',
            'bio',
            'location',
            'location_city',
            'location_region',
        ]));

        $updated = $this->applicantDocs->update($profile, $allowed);

        return $this->withApplicantCompletion($updated);
    }

    public function updateApplicantSkills(string $userId, array $skills): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $updated = $this->applicantDocs->update($profile, ['skills' => array_values($skills)]);

        return $this->withApplicantCompletion($updated);
    }

    public function addWorkExperience(string $userId, array $experience): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->work_experience ?? [];
        $items[] = $experience;

        $updated = $this->applicantDocs->update($profile, ['work_experience' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateWorkExperience(string $userId, int $index, array $experience): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->work_experience ?? [];

        if (! array_key_exists($index, $items)) {
            throw new InvalidArgumentException('WORK_EXPERIENCE_NOT_FOUND');
        }

        $items[$index] = array_merge($items[$index], $experience);

        $updated = $this->applicantDocs->update($profile, ['work_experience' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function removeWorkExperience(string $userId, int $index): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->work_experience ?? [];

        if (! array_key_exists($index, $items)) {
            throw new InvalidArgumentException('WORK_EXPERIENCE_NOT_FOUND');
        }

        unset($items[$index]);
        $updated = $this->applicantDocs->update($profile, ['work_experience' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function addEducation(string $userId, array $education): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->education ?? [];
        $items[] = $education;

        $updated = $this->applicantDocs->update($profile, ['education' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateEducation(string $userId, int $index, array $education): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->education ?? [];

        if (! array_key_exists($index, $items)) {
            throw new InvalidArgumentException('EDUCATION_NOT_FOUND');
        }

        $items[$index] = array_merge($items[$index], $education);

        $updated = $this->applicantDocs->update($profile, ['education' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function removeEducation(string $userId, int $index): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $items = $profile->education ?? [];

        if (! array_key_exists($index, $items)) {
            throw new InvalidArgumentException('EDUCATION_NOT_FOUND');
        }

        unset($items[$index]);
        $updated = $this->applicantDocs->update($profile, ['education' => array_values($items)]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateApplicantResume(string $userId, string $resumeUrl): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $updated = $this->applicantDocs->update($profile, ['resume_url' => $resumeUrl]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateApplicantCoverLetter(string $userId, string $coverLetterUrl): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $updated = $this->applicantDocs->update($profile, ['cover_letter_url' => $coverLetterUrl]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateApplicantPhoto(string $userId, string $photoUrl): array
    {
        $profile = $this->ensureApplicantDocument($userId);
        $updated = $this->applicantDocs->update($profile, ['profile_photo_url' => $photoUrl]);

        return $this->withApplicantCompletion($updated);
    }

    public function updateSocialLinks(string $userId, array $socialLinks): array
    {
        $this->validateSocialLinks($socialLinks);

        $profile = $this->ensureApplicantDocument($userId);
        $updated = $this->applicantDocs->update($profile, ['social_links' => $socialLinks]);

        return $this->withApplicantCompletion($updated);
    }

    public function getCompanyProfile(string $userId): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);
        $completion = $this->calculateCompanyCompletion($document, $companyProfile);

        return [
            'profile' => $document,
            'profile_completion_percentage' => $completion,
            'subscription_status' => $companyProfile->subscription_status,
            'subscription_tier' => $companyProfile->subscription_tier,
        ];
    }

    public function updateCompanyDetails(string $userId, array $data): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);

        $allowed = array_intersect_key($data, array_flip([
            'company_name',
            'tagline',
            'description',
            'industry',
            'company_size',
            'founded_year',
            'website_url',
            'address',
            'social_links',
        ]));

        if (array_key_exists('company_name', $allowed)) {
            $this->companyProfiles->update($companyProfile, [
                'company_name' => (string) $allowed['company_name'],
            ]);
        }

        $updated = $this->companyDocs->update($document, $allowed);

        return $this->withCompanyCompletion($updated, $companyProfile);
    }

    public function updateCompanyLogo(string $userId, string $logoUrl): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);

        $updated = $this->companyDocs->update($document, ['logo_url' => $logoUrl]);

        return $this->withCompanyCompletion($updated, $companyProfile);
    }

    public function addOfficeImage(string $userId, string $imageUrl): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);
        $images = $document->office_images ?? [];

        if (count($images) >= self::MAX_OFFICE_IMAGES) {
            throw new InvalidArgumentException('MAX_IMAGES_EXCEEDED');
        }

        $images[] = $imageUrl;
        $updated = $this->companyDocs->update($document, ['office_images' => array_values($images)]);

        return $this->withCompanyCompletion($updated, $companyProfile);
    }

    public function removeOfficeImage(string $userId, int $index): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);
        $images = $document->office_images ?? [];

        if (! array_key_exists($index, $images)) {
            throw new InvalidArgumentException('OFFICE_IMAGE_NOT_FOUND');
        }

        unset($images[$index]);

        $updated = $this->companyDocs->update($document, ['office_images' => array_values($images)]);

        return $this->withCompanyCompletion($updated, $companyProfile);
    }

    public function submitVerificationDocuments(string $userId, array $documents): array
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);

        $this->companyProfiles->update($companyProfile, ['verification_status' => 'pending']);

        $updated = $this->companyDocs->update($document, [
            'verification_documents' => array_values($documents),
        ]);

        return $this->withCompanyCompletion($updated, $companyProfile);
    }

    public function getOnboardingStatus(string $userId, string $role): array
    {
        return $this->onboarding->getOnboardingStatus($userId, $role);
    }

    public function completeOnboardingStep(string $userId, string $role, int $step, array $data = []): array
    {
        return $this->onboarding->completeOnboardingStep($userId, $role, $step, $data);
    }

    public function getProfileCompletion(string $userId, string $role): int
    {
        return $this->onboarding->getProfileCompletion($userId, $role);
    }

    public function calculateApplicantCompletion(ApplicantProfileDocument $profile): int
    {
        $percentage = $this->completion->calculateApplicantCompletionPercentage($profile);

        $this->applicantDocs->update($profile, ['profile_completion_percentage' => $percentage]);

        return $percentage;
    }

    public function calculateCompanyCompletion(CompanyProfileDocument $profile, CompanyProfile $companyProfile): int
    {
        $percentage = $this->completion->calculateCompanyCompletionPercentage($profile, $companyProfile);

        $this->companyDocs->update($profile, ['profile_completion_percentage' => $percentage]);

        return $percentage;
    }

    private function createApplicantProfile(User $user, ?string $avatarUrl): void
    {
        $this->applicantProfiles->create([
            'user_id' => $user->id,
            'subscription_tier' => 'free',
            'subscription_status' => 'inactive',
            'total_points' => 0,
            'daily_swipes_used' => 0,
            'daily_swipe_limit' => 15,
            'extra_swipes_balance' => 0,
        ]);

        $this->applicantDocs->create([
            'user_id' => $user->id,
            'first_name' => '',
            'last_name' => '',
            'profile_photo_url' => $avatarUrl,
            'bio' => null,
            'location' => null,
            'location_city' => null,
            'location_region' => null,
            'skills' => [],
            'work_experience' => [],
            'education' => [],
            'social_links' => [],
            'completed_profile_fields' => [],
            'notification_preferences' => [],
            'onboarding_step' => 1,
            'onboarding_completed_at' => null,
            'profile_completion_percentage' => 0,
        ]);
    }

    private function createCompanyProfile(User $user): void
    {
        $companyProfile = $this->companyProfiles->create([
            'user_id' => $user->id,
            'company_name' => '',
            'is_verified' => false,
            'verification_status' => 'pending',
            'subscription_tier' => 'none',
            'subscription_status' => 'inactive',
            'active_listings_count' => 0,
        ]);

        $this->companyDocs->create([
            'user_id' => $user->id,
            'company_id' => $companyProfile->id,
            'company_name' => '',
            'tagline' => null,
            'description' => null,
            'industry' => null,
            'company_size' => null,
            'founded_year' => null,
            'website_url' => null,
            'logo_url' => null,
            'office_images' => [],
            'social_links' => [],
            'address' => [],
            'benefits' => [],
            'culture_tags' => [],
            'notification_preferences' => [],
            'verification_documents' => [],
            'onboarding_step' => 1,
            'onboarding_completed_at' => null,
            'profile_completion_percentage' => 0,
        ]);
    }

    private function ensureApplicantDocument(string $userId): ApplicantProfileDocument
    {
        $profile = $this->applicantDocs->findByUserId($userId);

        if ($profile) {
            if (! $this->filled($profile->user_id ?? null)) {
                $profile = $this->applicantDocs->update($profile, ['user_id' => $userId]);
            }

            return $profile;
        }

        return $this->applicantDocs->create([
            'user_id' => $userId,
            'first_name' => '',
            'last_name' => '',
            'profile_photo_url' => null,
            'bio' => null,
            'location' => null,
            'location_city' => null,
            'location_region' => null,
            'skills' => [],
            'work_experience' => [],
            'education' => [],
            'social_links' => [],
            'completed_profile_fields' => [],
            'notification_preferences' => [],
            'onboarding_step' => 1,
            'onboarding_completed_at' => null,
            'profile_completion_percentage' => 0,
        ]);
    }

    private function ensureCompanyDocument(string $userId, CompanyProfile $companyProfile): CompanyProfileDocument
    {
        $profile = $this->companyDocs->findByUserId($userId);

        if (! $profile) {
            $profile = $this->companyDocs->findByCompanyId($companyProfile->id);
        }

        if ($profile) {
            return $profile;
        }

        return $this->companyDocs->create([
            'user_id' => $userId,
            'company_id' => $companyProfile->id,
            'company_name' => $companyProfile->company_name,
            'tagline' => null,
            'description' => null,
            'industry' => null,
            'company_size' => null,
            'founded_year' => null,
            'website_url' => null,
            'logo_url' => null,
            'office_images' => [],
            'social_links' => [],
            'address' => [],
            'benefits' => [],
            'culture_tags' => [],
            'notification_preferences' => [],
            'verification_documents' => [],
            'onboarding_step' => 1,
            'onboarding_completed_at' => null,
            'profile_completion_percentage' => 0,
        ]);
    }

    private function findCompanyProfileByUserId(string $userId): CompanyProfile
    {
        $companyProfile = $this->companyProfiles->findByUserId($userId);

        if (! $companyProfile) {
            throw new InvalidArgumentException('COMPANY_PROFILE_NOT_FOUND');
        }

        return $companyProfile;
    }

    private function withApplicantCompletion(ApplicantProfileDocument $profile): array
    {
        $completion = $this->calculateApplicantCompletion($profile);

        return [
            'profile' => $profile->fresh(),
            'profile_completion_percentage' => $completion,
        ];
    }

    private function withCompanyCompletion(CompanyProfileDocument $profile, CompanyProfile $companyProfile): array
    {
        $companyProfile = $companyProfile->fresh();
        $completion = $this->calculateCompanyCompletion($profile, $companyProfile);

        return [
            'profile' => $profile->fresh(),
            'profile_completion_percentage' => $completion,
            'subscription_status' => $companyProfile->subscription_status,
            'subscription_tier' => $companyProfile->subscription_tier,
        ];
    }

    private function validateSocialLinks(array $socialLinks): void
    {
        $this->socialLinksValidator->validate($socialLinks);
    }

    private function filled(mixed $value): bool
    {
        return is_string($value) ? trim($value) !== '' : ! empty($value);
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
