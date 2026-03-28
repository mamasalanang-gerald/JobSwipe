<?php

namespace App\Repositories\PostgreSQL;

use App\Models\PostgreSQL\PointEvent;
use Illuminate\Database\Eloquent\Collection;

class PointEventRepository
{
    public function create(array $data): PointEvent
    {
        return PointEvent::create($data);
    }

    public function getHistory(string $applicantId): Collection
    {
        return PointEvent::where('applicant_id', $applicantId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTotalPoints(string $applicantId): int
    {
        return PointEvent::where('applicant_id', $applicantId)->sum('points');
    }

    public function hasEvent(string $applicantId, string $eventType): bool
    {
        return PointEvent::where('applicant_id', $applicantId)
            ->where('event_type', $eventType)
            ->exists();
    }
}
