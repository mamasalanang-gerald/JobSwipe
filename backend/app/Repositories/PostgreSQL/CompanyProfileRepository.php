<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\CompanyProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CompanyProfileRepository
{
    public function findByUserId(string $userId): ?CompanyProfile
    {
        $byMembership = CompanyProfile::query()
            ->select('company_profiles.*')
            ->join('company_memberships', 'company_memberships.company_id', '=', 'company_profiles.id')
            ->where('company_memberships.user_id', $userId)
            ->where('company_memberships.status', 'active')
            ->orderByRaw("CASE WHEN company_memberships.membership_role = 'company_admin' THEN 0 ELSE 1 END")
            ->orderByDesc('company_memberships.joined_at')
            ->first();

        if ($byMembership) {
            return $byMembership;
        }

        // Legacy fallback during transition.
        return CompanyProfile::where('user_id', $userId)->first();
    }

    public function findById(string $id): ?CompanyProfile
    {
        return CompanyProfile::find($id);
    }

    public function findByDomain(string $domain): ?CompanyProfile
    {
        return CompanyProfile::where('company_domain', strtolower(trim($domain)))
            ->orderBy('created_at')
            ->first();
    }

    public function existsByDomain(string $domain): bool
    {
        return CompanyProfile::where('company_domain', strtolower(trim($domain)))->exists();
    }

    public function create(array $data): CompanyProfile
    {
        return CompanyProfile::create($data);
    }

    public function update(CompanyProfile $profile, array $data): CompanyProfile
    {
        $profile->update($data);

        return $profile->fresh();
    }

    public function getVerified(): Collection
    {
        return CompanyProfile::where('is_verified', true)->get();
    }

    public function getPendingVerification(): Collection
    {
        return CompanyProfile::where('verification_status', 'pending')->get();
    }

    public function markAsVerified(string $companyId): void
    {
        $profile = CompanyProfile::find($companyId);

        if (! $profile) {
            return;
        }

        $profile->update([
            'is_verified' => true,
            'verification_status' => 'approved',
        ]);
    }

    public function incrementListingsCount(string $companyId): void
    {
        CompanyProfile::where('id', $companyId)
            ->increment('active_listings_count');
    }

    public function decrementListingsCount(string $companyId): void
    {
        CompanyProfile::where('id', $companyId)
            ->where('active_listings_count', '>', 0)
            ->decrement('active_listings_count');
    }

    public function paginateByVerificationStatus(string $status, int $perPage = 20): LengthAwarePaginator
    {
        return CompanyProfile::where('verification_status', $status)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }

    public function countByVerificationStatus(string $status): int
    {
        return CompanyProfile::where('verification_status', $status)->count();
    }

    public function countVerified(): int
    {
        return CompanyProfile::where('is_verified', true)->count();
    }

    public function countTotal(): int
    {
        return CompanyProfile::count();
    }
}
