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
    ) {}

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
        if ($role === 'applicant') {
            $profile = $this->ensureApplicantDocument($userId);
            $step = $profile->onboarding_step ?? 1;

            return [
                'onboarding_step' => $step,
                'completed' => $step === 'completed',
                'total_steps' => self::APPLICANT_ONBOARDING_STEPS,
                'steps' => $this->applicantOnboardingSteps(),
                'profile_completion_percentage' => $profile->profile_completion_percentage ?? 0,
            ];
        }

        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $profile = $this->ensureCompanyDocument($userId, $companyProfile);
        $step = $profile->onboarding_step ?? 1;

        return [
            'onboarding_step' => $step,
            'completed' => $step === 'completed',
            'total_steps' => self::COMPANY_ONBOARDING_STEPS,
            'steps' => $this->companyOnboardingSteps(),
            'profile_completion_percentage' => $profile->profile_completion_percentage ?? 0,
        ];
    }

    public function completeOnboardingStep(string $userId, string $role, int $step, array $data = []): array
    {
        if ($role === 'applicant') {
            $profile = $this->ensureApplicantDocument($userId);
            $currentStep = $profile->onboarding_step ?? 1;

            if ($currentStep === 'completed') {
                return $this->getOnboardingStatus($userId, $role);
            }

            if ((int) $currentStep !== $step) {
                throw new InvalidArgumentException('INVALID_ONBOARDING_STEP');
            }

            $this->applyApplicantOnboardingStep($userId, $step, $data);
            $profile = $this->ensureApplicantDocument($userId);

            if ($step >= self::APPLICANT_ONBOARDING_STEPS) {
                $this->markOnboardingComplete($profile);
            } else {
                $this->applicantDocs->update($profile, ['onboarding_step' => $step + 1]);
            }

            return $this->getOnboardingStatus($userId, $role);
        }

        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $profile = $this->ensureCompanyDocument($userId, $companyProfile);
        $currentStep = $profile->onboarding_step ?? 1;

        if ($currentStep === 'completed') {
            return $this->getOnboardingStatus($userId, $role);
        }

        if ((int) $currentStep !== $step) {
            throw new InvalidArgumentException('INVALID_ONBOARDING_STEP');
        }

        $this->applyCompanyOnboardingStep($userId, $step, $data);
        $profile = $this->ensureCompanyDocument($userId, $companyProfile);

        if ($step >= self::COMPANY_ONBOARDING_STEPS) {
            $this->markOnboardingComplete($profile);
        } else {
            $this->companyDocs->update($profile, ['onboarding_step' => $step + 1]);
        }

        return $this->getOnboardingStatus($userId, $role);
    }

    public function getProfileCompletion(string $userId, string $role): int
    {
        if ($role === 'applicant') {
            $profile = $this->ensureApplicantDocument($userId);

            return $this->calculateApplicantCompletion($profile);
        }

        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $profile = $this->ensureCompanyDocument($userId, $companyProfile);

        return $this->calculateCompanyCompletion($profile, $companyProfile);
    }

    public function calculateApplicantCompletion(ApplicantProfileDocument $profile): int
    {
        $requiredTotal = 5;
        $optionalTotal = 6;

        $requiredFilled = 0;
        $optionalFilled = 0;

        if ($this->filled($profile->first_name ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->last_name ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->location ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->resume_url ?? null)) {
            $requiredFilled++;
        }

        if (! empty($profile->skills) && count($profile->skills) > 0) {
            $requiredFilled++;
        }

        if ($this->filled($profile->profile_photo_url ?? null)) {
            $optionalFilled++;
        }

        if ($this->filled($profile->bio ?? null)) {
            $optionalFilled++;
        }

        if (! empty($profile->work_experience) && count($profile->work_experience) > 0) {
            $optionalFilled++;
        }

        if (! empty($profile->education) && count($profile->education) > 0) {
            $optionalFilled++;
        }

        if ($this->filled($profile->cover_letter_url ?? null)) {
            $optionalFilled++;
        }

        if (! empty($profile->social_links) && count($profile->social_links) > 0) {
            $optionalFilled++;
        }

        $totalFields = $requiredTotal + $optionalTotal;
        $filledFields = $requiredFilled + $optionalFilled;
        $percentage = (int) round(($filledFields / $totalFields) * 100);

        $this->applicantDocs->update($profile, ['profile_completion_percentage' => $percentage]);

        return $percentage;
    }

    public function calculateCompanyCompletion(CompanyProfileDocument $profile, CompanyProfile $companyProfile): int
    {
        $requiredTotal = 6;
        $optionalTotal = 4;

        $requiredFilled = 0;
        $optionalFilled = 0;

        if ($this->filled($profile->company_name ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->description ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->industry ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->company_size ?? null)) {
            $requiredFilled++;
        }

        if ($this->filled($profile->logo_url ?? null)) {
            $requiredFilled++;
        }

        if ($companyProfile->subscription_status === 'active') {
            $requiredFilled++;
        }

        if ($this->filled($profile->website_url ?? null)) {
            $optionalFilled++;
        }

        if (! empty($profile->office_images) && count($profile->office_images) > 0) {
            $optionalFilled++;
        }

        if (! empty($profile->address) && count((array) $profile->address) > 0) {
            $optionalFilled++;
        }

        if (! empty($profile->verification_documents) && count($profile->verification_documents) > 0) {
            $optionalFilled++;
        }

        $totalFields = $requiredTotal + $optionalTotal;
        $filledFields = $requiredFilled + $optionalFilled;
        $percentage = (int) round(($filledFields / $totalFields) * 100);

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
            'extra_swipe_balance' => 0,
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
                $profile = $this->companyDocs->update($profile, ['user_id' => $userId]);
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

    private function applyApplicantOnboardingStep(string $userId, int $step, array $data): void
    {
        match ($step) {
            1 => $this->completeApplicantStepBasicInfo($userId, $data),
            2 => $this->completeApplicantStepResume($userId, $data),
            3 => $this->completeApplicantStepSkills($userId, $data),
            4 => $this->completeApplicantStepExperienceEducation($userId, $data),
            5 => $this->completeApplicantStepPhoto($userId, $data),
            6 => $this->completeApplicantStepSocialLinks($userId, $data),
            default => throw new InvalidArgumentException('INVALID_ONBOARDING_STEP'),
        };
    }

    private function applyCompanyOnboardingStep(string $userId, int $step, array $data): void
    {
        match ($step) {
            1 => $this->completeCompanyStepDetails($userId, $data),
            2 => $this->completeCompanyStepPayment($userId),
            3 => $this->completeCompanyStepMedia($userId, $data),
            4 => $this->completeCompanyStepVerification($userId, $data),
            default => throw new InvalidArgumentException('INVALID_ONBOARDING_STEP'),
        };
    }

    private function completeApplicantStepBasicInfo(string $userId, array $data): void
    {
        foreach (['first_name', 'last_name', 'location'] as $field) {
            if (! $this->filled($data[$field] ?? null)) {
                throw new InvalidArgumentException('STEP_DATA_INVALID');
            }
        }

        $this->updateApplicantBasicInfo($userId, $data);
    }

    private function completeApplicantStepResume(string $userId, array $data): void
    {
        if (! $this->filled($data['resume_url'] ?? null)) {
            throw new InvalidArgumentException('STEP_DATA_INVALID');
        }

        $this->updateApplicantResume($userId, (string) $data['resume_url']);
    }

    private function completeApplicantStepSkills(string $userId, array $data): void
    {
        if (! isset($data['skills']) || ! is_array($data['skills']) || count($data['skills']) < 1) {
            throw new InvalidArgumentException('STEP_DATA_INVALID');
        }

        $this->updateApplicantSkills($userId, $data['skills']);
    }

    private function completeApplicantStepExperienceEducation(string $userId, array $data): void
    {
        $profile = $this->ensureApplicantDocument($userId);

        $payload = [
            'work_experience' => isset($data['work_experience']) && is_array($data['work_experience']) ? array_values($data['work_experience']) : ($profile->work_experience ?? []),
            'education' => isset($data['education']) && is_array($data['education']) ? array_values($data['education']) : ($profile->education ?? []),
        ];

        $this->applicantDocs->update($profile, $payload);
        $this->withApplicantCompletion($profile);
    }

    private function completeApplicantStepPhoto(string $userId, array $data): void
    {
        if ($this->filled($data['profile_photo_url'] ?? null)) {
            $this->updateApplicantPhoto($userId, (string) $data['profile_photo_url']);
        }
    }

    private function completeApplicantStepSocialLinks(string $userId, array $data): void
    {
        if (isset($data['social_links']) && is_array($data['social_links'])) {
            $this->updateSocialLinks($userId, $data['social_links']);
        }
    }

    private function completeCompanyStepDetails(string $userId, array $data): void
    {
        foreach (['company_name', 'description', 'industry', 'company_size'] as $field) {
            if (! $this->filled($data[$field] ?? null)) {
                throw new InvalidArgumentException('STEP_DATA_INVALID');
            }
        }

        $this->updateCompanyDetails($userId, $data);
    }

    private function completeCompanyStepPayment(string $userId): void
    {
        $companyProfile = $this->findCompanyProfileByUserId($userId);

        if ($companyProfile->subscription_status !== 'active') {
            throw new InvalidArgumentException('SUBSCRIPTION_REQUIRED');
        }
    }

    private function completeCompanyStepMedia(string $userId, array $data): void
    {
        if (! $this->filled($data['logo_url'] ?? null)) {
            throw new InvalidArgumentException('STEP_DATA_INVALID');
        }

        $officeImages = $data['office_images'] ?? null;

        if (! is_array($officeImages) || count($officeImages) < 1 || count($officeImages) > self::MAX_OFFICE_IMAGES) {
            throw new InvalidArgumentException('STEP_DATA_INVALID');
        }

        $this->updateCompanyLogo($userId, (string) $data['logo_url']);

        $companyProfile = $this->findCompanyProfileByUserId($userId);
        $document = $this->ensureCompanyDocument($userId, $companyProfile);
        $this->companyDocs->update($document, ['office_images' => array_values($officeImages)]);
        $this->withCompanyCompletion($document, $companyProfile);
    }

    private function completeCompanyStepVerification(string $userId, array $data): void
    {
        if (isset($data['verification_documents']) && is_array($data['verification_documents'])) {
            $this->submitVerificationDocuments($userId, $data['verification_documents']);
        }
    }

    private function applicantOnboardingSteps(): array
    {
        return [
            ['step' => 1, 'key' => 'basic_info', 'required' => true],
            ['step' => 2, 'key' => 'resume_upload', 'required' => true],
            ['step' => 3, 'key' => 'skills', 'required' => true],
            ['step' => 4, 'key' => 'experience_education', 'required' => false],
            ['step' => 5, 'key' => 'profile_photo', 'required' => false],
            ['step' => 6, 'key' => 'social_links', 'required' => false],
        ];
    }

    private function companyOnboardingSteps(): array
    {
        return [
            ['step' => 1, 'key' => 'company_details', 'required' => true],
            ['step' => 2, 'key' => 'payment', 'required' => true],
            ['step' => 3, 'key' => 'media', 'required' => true],
            ['step' => 4, 'key' => 'verification_documents', 'required' => false],
        ];
    }

    private function markOnboardingComplete(ApplicantProfileDocument|CompanyProfileDocument $profile): void
    {
        if ($profile instanceof ApplicantProfileDocument) {
            $this->applicantDocs->update($profile, [
                'onboarding_step' => 'completed',
                'onboarding_completed_at' => now(),
            ]);
            $this->calculateApplicantCompletion($profile->fresh());

            return;
        }

        $this->companyDocs->update($profile, [
            'onboarding_step' => 'completed',
            'onboarding_completed_at' => now(),
        ]);

        $companyProfile = null;

        if ($this->filled($profile->user_id ?? null)) {
            $companyProfile = $this->companyProfiles->findByUserId((string) $profile->user_id);
        }

        if (! $companyProfile && $this->filled($profile->company_id ?? null)) {
            $companyProfile = $this->companyProfiles->findById((string) $profile->company_id);
        }

        if (! $companyProfile) {
            throw new InvalidArgumentException('COMPANY_PROFILE_NOT_FOUND');
        }

        $this->calculateCompanyCompletion($profile->fresh(), $companyProfile);
    }

    private function validateSocialLinks(array $socialLinks): void
    {
        if (isset($socialLinks['linkedin']) && ! preg_match('/^https:\/\/(www\.)?linkedin\.com\/in\/.+/i', (string) $socialLinks['linkedin'])) {
            throw new InvalidArgumentException('INVALID_URL:linkedin');
        }

        if (isset($socialLinks['github']) && ! preg_match('/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i', (string) $socialLinks['github'])) {
            throw new InvalidArgumentException('INVALID_URL:github');
        }

        if (isset($socialLinks['portfolio'])) {
            $portfolio = (string) $socialLinks['portfolio'];
            if (! filter_var($portfolio, FILTER_VALIDATE_URL) || ! str_starts_with($portfolio, 'https://')) {
                throw new InvalidArgumentException('INVALID_URL:portfolio');
            }
        }
    }

    private function filled(mixed $value): bool
    {
        return is_string($value) ? trim($value) !== '' : ! empty($value);
    }
}
