<?php

namespace App\Services;

use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\User;
use App\Repositories\MongoDB\CompanyProfileDocumentRepository;
use App\Repositories\PostgreSQL\CompanyProfileRepository;
use App\Repositories\PostgreSQL\CompanyReviewRepository;
use App\Repositories\PostgreSQL\JobPostingRepository;
use App\Repositories\PostgreSQL\UserRepository;
use RuntimeException;

class AdminService
{
    public function __construct(
        private UserRepository $users,
        private CompanyProfileRepository $companies,
        private CompanyProfileDocumentRepository $companyDocs,
        private CompanyReviewRepository $reviews,
        private JobPostingRepository $jobs,
        private NotificationService $notifications,
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
}
