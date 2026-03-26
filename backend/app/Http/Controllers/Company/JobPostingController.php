<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\CreateJobPostingRequest;
use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\JobPosting;
use App\Models\PostgreSQL\JobSkill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobPostingController extends Controller
{
    /**
     * GET /api/v1/company/jobs
     *
     * List all job postings for the authenticated user's company.
     * Eager-loads skills to avoid N+1 queries, paginated at 20.
     */
    public function index(Request $request): JsonResponse
    {
        $company = $this->getCompany($request);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found for this user', 403);
        }

        $jobs = JobPosting::where('company_id', $company->id)
            ->with('skills')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return $this->success(data: $jobs);
    }

    /**
     * POST /api/v1/company/jobs
     *
     * Create a new job posting — goes active immediately.
     * Checks active listing limit for basic-tier companies.
     * Uses lockForUpdate to prevent race conditions on concurrent creates.
     * Wraps job + skills creation in a transaction for atomicity.
     */
    public function store(CreateJobPostingRequest $request): JsonResponse
    {
        $company = $this->getCompany($request);

        if (! $company) {
            return $this->error('NO_COMPANY_PROFILE', 'No company profile found for this user', 403);
        }

        $job = null;

        try {
            DB::transaction(function () use ($request, $company, &$job) {
                // Lock the company row to prevent concurrent creates from
                // both passing the limit check before either increments
                $locked = CompanyProfile::lockForUpdate()->find($company->id);

                if ($locked->subscription_tier === 'basic' && $locked->active_listings_count >= 5) {
                    throw new \App\Exceptions\ListingLimitReachedException;
                }

                $job = JobPosting::create([
                    'company_id' => $locked->id,
                    'title' => $request->title,
                    'description' => $request->description,
                    'salary_min' => $request->salary_min,
                    'salary_max' => $request->salary_max,
                    'salary_is_hidden' => $request->salary_is_hidden ?? false,
                    'work_type' => $request->work_type,
                    'location' => $request->location,
                    'location_city' => $request->location_city,
                    'location_region' => $request->location_region,
                    'interview_template' => $request->interview_template,
                    'status' => 'active',
                    'published_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]);

                foreach ($request->skills as $skill) {
                    JobSkill::create([
                        'job_posting_id' => $job->id,
                        'skill_name' => $skill['name'],
                        'skill_type' => $skill['type'],
                    ]);
                }

                $locked->increment('active_listings_count');
            });
        } catch (\App\Exceptions\ListingLimitReachedException) {
            return $this->error('LISTING_LIMIT_REACHED', 'Active listing limit reached for your subscription tier', 403);
        }

        // Load skills so the response includes them
        $job->load('skills');

        // Index in Meilisearch so applicants can find it
        $job->searchable();

        return $this->success(data: $job, message: 'Job posting created and published', status: 201);
    }

    /**
     * GET /api/v1/company/jobs/{id}
     *
     * Show a single job posting with its skills.
     * Only the owning company can view their own posting through this endpoint.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::with('skills')->findOrFail($id);

        if (! $this->ownsJob($request, $job)) {
            return $this->error('UNAUTHORIZED', 'Not authorized to view this job posting', 403);
        }

        return $this->success(data: $job);
    }

    /**
     * PUT /api/v1/company/jobs/{id}
     *
     * Update a job posting. Only active postings can be edited.
     * Closed and expired postings are locked — create a new one instead.
     * Re-indexes in Meilisearch after update so search stays current.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);

        if (! $this->ownsJob($request, $job)) {
            return $this->error('UNAUTHORIZED', 'Not authorized to update this job posting', 403);
        }

        if ($job->status !== 'active') {
            return $this->error(
                'INVALID_STATUS',
                'Only active job postings can be edited. Closed and expired postings are locked.',
                422
            );
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'min:100'],
            'work_type' => ['sometimes', 'in:remote,hybrid,on_site'],
            'location' => ['nullable', 'string', 'max:255'],
            'location_city' => ['nullable', 'string', 'max:100'],
            'location_region' => ['nullable', 'string', 'max:100'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'salary_is_hidden' => ['boolean'],
            'interview_template' => ['sometimes', 'string', 'max:1000'],
            'skills' => ['sometimes', 'array', 'min:1', 'max:20'],
            'skills.*.name' => ['required_with:skills', 'string', 'max:100'],
            'skills.*.type' => ['required_with:skills', 'in:hard,soft'],
        ]);

        $skills = $validated['skills'] ?? null;
        unset($validated['skills']);

        DB::transaction(function () use ($validated, $skills, $job) {
            $job->update($validated);

            if ($skills !== null) {
                $job->skills()->delete();

                foreach ($skills as $skill) {
                    JobSkill::create([
                        'job_posting_id' => $job->id,
                        'skill_name' => $skill['name'],
                        'skill_type' => $skill['type'],
                    ]);
                }
            }
        });

        $job->load('skills');

        // Re-index so search results reflect the changes
        $job->searchable();

        return $this->success(data: $job, message: 'Job posting updated');
    }

    /**
     * DELETE /api/v1/company/jobs/{id}
     *
     * Permanently remove a closed or expired posting.
     * Active postings must be closed first to keep counters consistent.
     * Skills cascade-delete via the foreign key constraint in the migration.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);

        if (! $this->ownsJob($request, $job)) {
            return $this->error('UNAUTHORIZED', 'Not authorized to delete this job posting', 403);
        }

        if ($job->status === 'active') {
            return $this->error('INVALID_STATUS', 'Cannot delete an active job posting. Close it first.', 422);
        }

        $job->delete();

        return $this->success(message: 'Job posting deleted');
    }

    /**
     * POST /api/v1/company/jobs/{id}/close
     *
     * Manually close an active posting. This is a terminal action —
     * the posting is pulled from search and the listing count is freed.
     * Once closed, the posting can only be viewed or deleted.
     */
    public function close(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);

        if (! $this->ownsJob($request, $job)) {
            return $this->error('UNAUTHORIZED', 'Not authorized to close this job posting', 403);
        }

        if ($job->status !== 'active') {
            return $this->error('INVALID_STATUS', 'Only active job postings can be closed', 422);
        }

        $job->update(['status' => 'closed']);

        $job->company->decrement('active_listings_count');

        // Remove from Meilisearch so applicants no longer see it
        $job->unsearchable();

        return $this->success(message: 'Job posting closed');
    }

    /**
     * Resolve the authenticated user's company profile.
     * Uses loadMissing so repeated calls within the same request
     * only hit the database once.
     */
    private function getCompany(Request $request): ?CompanyProfile
    {
        $request->user()->loadMissing('companyProfile');

        return $request->user()->companyProfile;
    }

    /**
     * Check if the authenticated user's company owns the given job posting.
     */
    private function ownsJob(Request $request, JobPosting $job): bool
    {
        $company = $this->getCompany($request);

        return $company && $job->company_id === $company->id;
    }
}
