<?php

namespace App\Services;

use App\Models\PostgreSQL\CompanyMembership;
use App\Models\PostgreSQL\CompanyProfile;
use App\Repositories\PostgreSQL\CompanyProfileRepository;

class CompanyMembershipService
{
    public function __construct(
        private CompanyProfileRepository $companyProfiles,
    ) {}

    public function addMember(
        string $companyId,
        string $userId,
        string $role,
        ?string $invitedByUserId = null
    ): CompanyMembership {
        $membership = CompanyMembership::firstOrNew([
            'company_id' => $companyId,
            'user_id' => $userId,
        ]);

        $membership->membership_role = $role;
        $membership->status = 'active';
        $membership->invited_by_user_id = $invitedByUserId;
        $membership->joined_at = $membership->exists ? $membership->joined_at : now();
        $membership->save();

        return $membership->fresh();
    }

    public function isAdmin(string $companyId, string $userId): bool
    {
        return CompanyMembership::query()
            ->where('company_id', $companyId)
            ->where('user_id', $userId)
            ->where('membership_role', 'company_admin')
            ->where('status', 'active')
            ->exists();
    }

    public function getPrimaryCompanyForUser(string $userId): ?CompanyProfile
    {
        return $this->companyProfiles->findByUserId($userId);
    }

    public function getMembership(string $companyId, string $userId): ?CompanyMembership
    {
        return CompanyMembership::query()
            ->where('company_id', $companyId)
            ->where('user_id', $userId)
            ->first();
    }
}
