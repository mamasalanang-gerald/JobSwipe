<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\CompanyProfile;
use Illuminate\Database\Eloquent\Collection;

class CompanyProfileRepository
{
    public function findByUserId(string $userId): ?CompanyProfile
    {
        return CompanyProfile::where('user_id', $userId)->first();
    }

    public function findById(string $id): ?CompanyProfile
    {
        return CompanyProfile::find($id);
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
        CompanyProfile::where('id', $companyId)->update([
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
}
