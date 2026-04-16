<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\JobPosting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class JobPostingRepository
{
    public function findById(string $id): ?JobPosting
    {
        return JobPosting::find($id);
    }

    public function create(array $data): JobPosting
    {
        return JobPosting::create($data);
    }

    public function update(JobPosting $job, array $data): JobPosting
    {
        $job->update($data);

        return $job->fresh();
    }

    public function delete(JobPosting $job): bool
    {
        return $job->delete();
    }

    public function getActive(int $perPage = 15): LengthAwarePaginator
    {
        return JobPosting::active()
            ->with(['company', 'skills'])
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    public function getByCompany(string $companyId): Collection
    {
        return JobPosting::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getActiveByCompany(string $companyId): Collection
    {
        return JobPosting::active()
            ->where('company_id', $companyId)
            ->orderBy('published_at', 'desc')
            ->get();
    }

    public function markAsExpired(string $jobId): void
    {
        JobPosting::where('id', $jobId)->update([
            'status' => 'expired',
        ]);
    }

    /**
     * Get expiring jobs (for cron job)
     */
    public function getExpiring(): Collection
    {
        return JobPosting::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->get();
    }

    public function searchByLocation(string $city, ?string $region = null): Collection
    {
        $query = JobPosting::active()->where('location_city', $city);

        if ($region) {
            $query->where('location_region', $region);
        }

        return $query->get();
    }

    public function countTotal(): int
    {
        return JobPosting::count();
    }

    public function countActive(): int
    {
        return JobPosting::active()->count();
    }
}
