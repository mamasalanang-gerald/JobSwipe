<?php

namespace App\Services;

use App\Mail\CompanySuspendedMail;
use App\Mail\CompanyUnsuspendedMail;
use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\User;
use App\Repositories\MongoDB\CompanyProfileDocumentRepository;
use App\Repositories\PostgreSQL\AdminAnalyticsRepository;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use App\Repositories\PostgreSQL\CompanyReviewRepository;
use App\Repositories\PostgreSQL\JobPostingRepository;
use App\Repositories\PostgreSQL\TrustEventRepository;
use App\Repositories\PostgreSQL\UserRepository;
use App\Support\AdminCacheable;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class AdminService
{
    use AdminCacheable;

    public function __construct(
        private UserRepository $users,
        private CompanyProfileRepository $companies,
        private CompanyProfileDocumentRepository $companyDocs,
        private CompanyReviewRepository $reviews,
        private JobPostingRepository $jobs,
        private NotificationService $notifications,
        private AdminAnalyticsRepository $analytics,
        private TrustEventRepository $trustEvents,
        private TrustScoreService $trustScoreService,
    ) {}

    public function approveCompanyVerification(string $companyId, string $moderatorId): CompanyProfile
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        if ($company->verification_status === 'approved') {
            throw new RuntimeException('Company already approved');
        }

        $updated = $this->companies->update($company, [
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);

        if ($updated->owner_user_id) {
            $this->notifications->create(
                userId: $updated->owner_user_id,
                type: 'company_verification_approved',
                title: 'Verification approved',
                body: 'Your company verification has been approved.',
                data: ['company_id' => $updated->id],
            );
        }

        return $updated;
    }

    public function rejectCompanyVerification(string $companyId, string $moderatorId, string $reason): CompanyProfile
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        if ($company->verification_status === 'rejected') {
            throw new RuntimeException('Company already rejected');
        }

        $updated = $this->companies->update($company, [
            'is_verified' => false,
            'verification_status' => 'rejected',
        ]);

        $this->companyDocs->updateFields($companyId, [
            'verification_rejection_reason' => $reason,
            'verification_rejected_at' => now(),
            'verification_rejected_by' => $moderatorId,
        ]);

        if ($updated->owner_user_id) {
            $this->notifications->create(
                userId: $updated->owner_user_id,
                type: 'company_verification_rejected',
                title: 'Verification rejected',
                body: $reason,
                data: ['company_id' => $updated->id, 'reason' => $reason],
            );
        }

        return $updated;
    }

    public function getCompanyVerificationDetail(string $companyId): array
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        $document = $this->companyDocs->findByCompanyId($companyId);

        return [
            'company' => $company,
            'documents' => $document->verification_documents ?? [],
            'rejection_reason' => $document->verification_rejection_reason ?? null,
            'rejected_at' => $document->verification_rejected_at ?? null,
        ];
    }

    public function banUser(string $userId, string $actorId): User
    {
        $user = $this->users->findById($userId);

        if (! $user) {
            throw new RuntimeException('User not found');
        }

        if ($user->id === $actorId) {
            throw new RuntimeException('Cannot ban yourself');
        }

        if ($user->role === 'super_admin') {
            throw new RuntimeException('Cannot ban a super admin');
        }

        $updated = $this->users->update($user, ['is_banned' => true]);
        $updated->tokens()->delete();

        return $updated;
    }

    public function unbanUser(string $userId): User
    {
        $user = $this->users->findById($userId);

        if (! $user) {
            throw new RuntimeException('User not found');
        }

        return $this->users->update($user, ['is_banned' => false]);
    }

    public function dashboardStats(): array
    {
        return [
            'users' => [
                'total' => $this->users->countTotal(),
                'applicants' => $this->users->countByRole('applicant'),
                'hr' => $this->users->countByRole('hr'),
                'company_admins' => $this->users->countByRole('company_admin'),
                'moderators' => $this->users->countByRole('moderator'),
                'super_admins' => $this->users->countByRole('super_admin'),
                'banned' => $this->users->countBanned(),
            ],
            'companies' => [
                'total' => $this->companies->countTotal(),
                'verified' => $this->companies->countVerified(),
                'pending_verification' => $this->companies->countByVerificationStatus('pending'),
                'rejected_verification' => $this->companies->countByVerificationStatus('rejected'),
            ],
            'reviews' => [
                'total' => $this->reviews->countTotal(),
                'flagged' => $this->reviews->countFlagged(),
            ],
            'jobs' => [
                'total' => $this->jobs->countTotal(),
                'active' => $this->jobs->countActive(),
            ],
        ];
    }

    /**
     * Get user growth data with caching.
     */
    public function getUserGrowthData(int $days = 30): array
    {
        return $this->cacheUserGrowth($days, function () use ($days) {
            $data = $this->analytics->getUserGrowthData($days);

            // Calculate growth percentage compared to previous period
            $currentPeriodTotal = array_sum(array_column($data, 'total'));
            $halfPoint = (int) ceil($days / 2);
            $currentPeriod = array_slice($data, $halfPoint);
            $previousPeriod = array_slice($data, 0, $halfPoint);

            $currentTotal = array_sum(array_column($currentPeriod, 'total'));
            $previousTotal = array_sum(array_column($previousPeriod, 'total'));

            $growthPercentage = $previousTotal > 0
                ? (($currentTotal - $previousTotal) / $previousTotal) * 100
                : 0;

            return [
                'data' => $data,
                'growth_percentage' => round($growthPercentage, 2),
                'current_period_total' => $currentTotal,
                'previous_period_total' => $previousTotal,
            ];
        });
    }

    /**
     * Get revenue data with caching.
     */
    public function getRevenueData(int $months = 12): array
    {
        return $this->cacheRevenueData($months, function () use ($months) {
            $data = $this->analytics->getRevenueData($months);

            // Calculate growth percentage compared to previous period
            $halfPoint = (int) ceil($months / 2);
            $currentPeriod = array_slice($data, $halfPoint);
            $previousPeriod = array_slice($data, 0, $halfPoint);

            $currentTotal = array_sum(array_column($currentPeriod, 'total'));
            $previousTotal = array_sum(array_column($previousPeriod, 'total'));

            $growthPercentage = $previousTotal > 0
                ? (($currentTotal - $previousTotal) / $previousTotal) * 100
                : 0;

            return [
                'data' => $data,
                'growth_percentage' => round($growthPercentage, 2),
                'current_period_total' => $currentTotal,
                'previous_period_total' => $previousTotal,
            ];
        });
    }

    /**
     * Get recent platform activity with caching.
     */
    public function getRecentActivity(int $limit = 50): array
    {
        return $this->cacheRecentActivity(function () use ($limit) {
            return $this->analytics->getRecentActivity($limit);
        });
    }

    /**
     * List companies with filtering and pagination.
     */
    public function listCompanies(array $filters, int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->companies->searchAdmin($filters, $perPage);
    }

    /**
     * Get detailed company information for admin view.
     *
     * @throws RuntimeException
     */
    public function getCompanyDetails(string $companyId): array
    {
        $companyData = $this->companies->getCompanyWithTrustData($companyId);

        if (! $companyData) {
            throw new RuntimeException('Company not found');
        }

        // Get MongoDB document for additional details
        $document = $this->companyDocs->findByCompanyId($companyId);

        if ($document) {
            $companyData['industry'] = $document->industry ?? null;
            $companyData['company_size'] = $document->company_size ?? null;
            $companyData['founded_year'] = $document->founded_year ?? null;
            $companyData['website_url'] = $document->website_url ?? null;
            $companyData['logo_url'] = $document->logo_url ?? null;
            $companyData['description'] = $document->description ?? null;
            $companyData['tagline'] = $document->tagline ?? null;
        }

        return $companyData;
    }

    /**
     * Suspend a company account.
     *
     * @throws RuntimeException
     */
    public function suspendCompany(string $companyId, string $reason, string $actorId): bool
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        if ($company->status === 'suspended') {
            throw new RuntimeException('Company is already suspended');
        }

        $result = $this->companies->suspendCompany($companyId, $reason);

        if ($result && $company->owner_user_id) {
            // Send notification to company owner
            $this->notifications->create(
                userId: $company->owner_user_id,
                type: 'company_suspended',
                title: 'Company Account Suspended',
                body: "Your company account has been suspended. Reason: {$reason}",
                data: [
                    'company_id' => $companyId,
                    'reason' => $reason,
                    'suspended_by' => $actorId,
                ],
            );

            // Send email notification
            $owner = $this->users->findById($company->owner_user_id);
            if ($owner && $owner->email) {
                Mail::to($owner->email)->send(new CompanySuspendedMail($company, $reason));
            }
        }

        return $result;
    }

    /**
     * Unsuspend (reactivate) a company account.
     *
     * @throws RuntimeException
     */
    public function unsuspendCompany(string $companyId, string $actorId): bool
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        if ($company->status !== 'suspended') {
            throw new RuntimeException('Company is not suspended');
        }

        $result = $this->companies->unsuspendCompany($companyId);

        if ($result && $company->owner_user_id) {
            // Send notification to company owner
            $this->notifications->create(
                userId: $company->owner_user_id,
                type: 'company_unsuspended',
                title: 'Company Account Reactivated',
                body: 'Your company account has been reactivated and is now active.',
                data: [
                    'company_id' => $companyId,
                    'unsuspended_by' => $actorId,
                ],
            );

            // Send email notification
            $owner = $this->users->findById($company->owner_user_id);
            if ($owner && $owner->email) {
                Mail::to($owner->email)->send(new CompanyUnsuspendedMail($company));
            }
        }

        return $result;
    }

    /**
     * Recalculate trust score for a company.
     *
     * Requirements: 6.3
     *
     * @throws RuntimeException
     */
    public function recalculateTrustScore(string $companyId, string $actorId): float
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        $oldScore = $company->trust_score;

        // Recalculate trust score using TrustScoreService
        $this->trustScoreService->calculateAndUpdate($companyId);

        // Get updated company
        $updatedCompany = $this->companies->findById($companyId);
        $newScore = $updatedCompany->trust_score;

        // Log the recalculation
        $this->trustEvents->logTrustRecalculation($companyId, $oldScore, $newScore, $actorId);

        return $newScore;
    }

    /**
     * Manually adjust trust score for a company.
     *
     * Requirements: 6.5
     *
     * @throws RuntimeException
     */
    public function adjustTrustScore(string $companyId, float $newScore, string $reason, string $actorId): bool
    {
        $company = $this->companies->findById($companyId);

        if (! $company) {
            throw new RuntimeException('Company not found');
        }

        // Validate score range
        if ($newScore < 0 || $newScore > 100) {
            throw new RuntimeException('Trust score must be between 0 and 100');
        }

        $oldScore = $company->trust_score;

        // Determine trust level based on score
        $trustLevel = match (true) {
            $newScore >= 80 => 'trusted',
            $newScore >= 60 => 'established',
            $newScore >= 40 => 'moderate',
            $newScore >= 20 => 'low',
            default => 'untrusted',
        };

        // Determine listing cap based on trust level
        $listingCap = match ($trustLevel) {
            'trusted' => 15,
            'established' => 10,
            'moderate' => 5,
            'low' => 2,
            'untrusted' => 0,
        };

        // Update company
        $this->companies->update($company, [
            'trust_score' => $newScore,
            'trust_level' => $trustLevel,
            'listing_cap' => $listingCap,
        ]);

        // Log the adjustment
        $this->trustEvents->logTrustAdjustment($companyId, $oldScore, $newScore, $reason, $actorId);

        // Notify company owner
        if ($company->owner_user_id) {
            $this->notifications->create(
                userId: $company->owner_user_id,
                type: 'trust_score_adjusted',
                title: 'Trust Score Updated',
                body: "Your company's trust score has been adjusted to {$newScore}. Reason: {$reason}",
                data: [
                    'company_id' => $companyId,
                    'old_score' => $oldScore,
                    'new_score' => $newScore,
                    'reason' => $reason,
                ]
            );
        }

        return true;
    }

    /**
     * Get company trust history.
     *
     * Requirements: 6.4
     */
    public function getCompanyTrustHistory(string $companyId): array
    {
        return $this->trustEvents->getByCompany($companyId)->toArray();
    }

    /**
     * Get companies with low trust scores.
     *
     * Requirements: 6.2
     */
    public function getLowTrustCompanies(int $threshold = 40): array
    {
        return $this->trustEvents->getLowTrustCompanies($threshold)->toArray();
    }
}
