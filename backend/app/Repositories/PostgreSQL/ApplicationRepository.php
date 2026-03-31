<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\Application;
use Illuminate\Database\Eloquent\Collection;

class ApplicationRepository
{
    public function findById(string $id): ?Application
    {
        return Application::find($id);
    }

    public function create(string $applicantId, string $jobPostingId): Application
    {
        return Application::create([
            'applicant_id' => $applicantId,
            'job_posting_id' => $jobPostingId,
            'status' => 'applied',
        ]);
    }

    public function markInvited(string $applicantId, string $jobPostingId, string $message): void
    {
        Application::where('applicant_id', $applicantId)
            ->where('job_posting_id', $jobPostingId)
            ->update([
                'status' => 'invited',
                'invitation_message' => $message,
                'invited_at' => now(),
            ]);
    }

    public function update(Application $application, array $data): Application
    {
        $application->update($data);

        return $application->fresh();
    }

    public function hasApplied(string $applicantId, string $jobPostingId): bool
    {
        return Application::where('applicant_id', $applicantId)
            ->where('job_posting_id', $jobPostingId)
            ->exists();
    }

    public function getByApplicant(string $applicantId): Collection
    {
        return Application::where('applicant_id', $applicantId)
            ->with(['jobPosting.company'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getByJobPosting(string $jobPostingId): Collection
    {
        return Application::where('job_posting_id', $jobPostingId)
            ->with('applicant.user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPending(string $jobPostingId): Collection
    {
        return Application::where('job_posting_id', $jobPostingId)
            ->where('status', 'pending')
            ->with('applicant.user')
            ->get();
    }

    public function updateStatus(string $applicationId, string $status): void
    {
        Application::where('id', $applicationId)->update(['status' => $status]);
    }

    public function countByStatus(string $jobPostingId, string $status): int
    {
        return Application::where('job_posting_id', $jobPostingId)
            ->where('status', $status)
            ->count();
    }
}
