<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\MatchRecord;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MatchRepository
{
    public function create(array $data): MatchRecord
    {
        return MatchRecord::create($data);
    }

    public function findById(string $id): ?MatchRecord
    {
        return MatchRecord::find($id);
    }

    public function findByIdOrFail(string $id): MatchRecord
    {
        return MatchRecord::findOrFail($id);
    }

    public function findByIdOrFailForUpdate(string $id): MatchRecord
    {
        return MatchRecord::where('id', $id)
            ->lockForUpdate()
            ->with(['applicant'])
            ->firstOrFail();
            
    }

    public function findByApplicationId(string $applicationId): ?MatchRecord
    {
        return MatchRecord::where('application_id', $applicationId)->first();
    }

    public function getForApplicant(string $applicantId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = MatchRecord::where('applicant_id', $applicantId)
            ->with(['jobPosting.company', 'hrUser', 'application']);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByRaw("
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'accepted' THEN 2
                WHEN 'closed' THEN 3
                WHEN 'expired' THEN 4
                WHEN 'declined' THEN 5
            END ASC,
            matched_at DESC
        ")->paginate($perPage);
    }

    public function getForHrUser(string $hrUserId, ?string $jobId = null, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = MatchRecord::where('hr_user_id', $hrUserId)
            ->with(['applicant.user', 'jobPosting', 'application']);

        if ($jobId) {
            $query->where('job_posting_id', $jobId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderByRaw("
            CASE status
                WHEN 'pending' THEN 1
                WHEN 'accepted' THEN 2
                WHEN 'closed' THEN 3
                WHEN 'expired' THEN 4
                WHEN 'declined' THEN 5
            END ASC,
            matched_at DESC
        ")->paginate($perPage);
    }

    public function getForJobPosting(string $jobPostingId): Collection
    {
        return MatchRecord::where('job_posting_id', $jobPostingId)
            ->with(['applicant.user', 'application'])
            ->orderBy('matched_at', 'desc')
            ->get();
    }

    public function getPendingExpired(): Collection
    {
        return MatchRecord::where('status', 'pending')
            ->where('response_deadline', '<=', now())
            ->get();
    }

    public function expirePendingForApplicant(string $applicantId): int
    {
        return MatchRecord::where('applicant_id', $applicantId)
            ->where('status', 'pending')
            ->where('response_deadline', '<=', now())
            ->update(['status' => 'expired']);
    }

    public function expirePendingForHrUser(string $hrUserId): int
    {
        return MatchRecord::where('hr_user_id', $hrUserId)
            ->where('status', 'pending')
            ->where('response_deadline', '<=', now())
            ->update(['status' => 'expired']);
    }

    public function updateStatus(string $id, string $status): int
    {
        return MatchRecord::where('id', $id)->update(['status' => $status]);
    }

    public function expireIfPendingAndDeadlinePassed(string $id): int
    {
        return MatchRecord::where('id', $id)
            ->where('status', 'pending')
            ->where('response_deadline', '<=', now())
            ->update(['status' => 'expired']);
    }

    public function accept(string $id): int
    {
        return MatchRecord::where('id', $id)->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);
    }

    public function acceptIfPendingBeforeDeadline(string $id): int
    {
        return MatchRecord::where('id', $id)
            ->where('status', 'pending')
            ->where('response_deadline', '>', now())
            ->update([
                'status' => 'accepted',
                'responded_at' => now(),
            ]);
    }

    public function decline(string $id): int
    {
        return MatchRecord::where('id', $id)->update([
            'status' => 'declined',
            'responded_at' => now(),
        ]);
    }

    public function declineIfPendingBeforeDeadline(string $id): int
    {
        return MatchRecord::where('id', $id)
            ->where('status', 'pending')
            ->where('response_deadline', '>', now())
            ->update([
                'status' => 'declined',
                'responded_at' => now(),
            ]);
    }

    public function close(string $id, string $closedByUserId): int
    {
        return MatchRecord::where('id', $id)->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closed_by' => $closedByUserId,
        ]);
    }

    public function closeIfAccepted(string $id, string $closedByUserId): int
    {
        return MatchRecord::where('id', $id)
            ->where('status', 'accepted')
            ->update([
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $closedByUserId,
            ]);
    }

    public function getUnreadMessageCount(string $matchId, string $userId): int
    {
        return \App\Models\PostgreSQL\MatchMessage::where('match_id', $matchId)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
