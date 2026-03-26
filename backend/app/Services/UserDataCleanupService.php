<?php

namespace App\Services;

use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\MongoDB\CompanyProfileDocument;
use App\Models\MongoDB\SwipeHistory;
use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\User;
use App\Repositories\Redis\OTPCacheRepository;
use Illuminate\Support\Facades\Redis;

class UserDataCleanupService
{
    public function __construct(private OTPCacheRepository $otpCache) {}

    public function cleanupForDeletedUser(User $user): void
    {
        $companyId = CompanyProfile::query()
            ->where('user_id', $user->id)
            ->value('id');

        ApplicantProfileDocument::where('user_id', $user->id)->delete();

        CompanyProfileDocument::where('user_id', $user->id)->delete();
        if (is_string($companyId) && $companyId !== '') {
            CompanyProfileDocument::where('company_id', $companyId)->delete();
        }

        SwipeHistory::where('user_id', $user->id)
            ->orWhere('target_id', $user->id)
            ->delete();

        $this->otpCache->delete($user->email);

        Redis::del("swipe:deck:seen:{$user->id}");

        $counterKeys = Redis::keys("swipe:counter:{$user->id}:*");
        if (! empty($counterKeys)) {
            Redis::del(...$counterKeys);
        }

        $hrSeenKeys = Redis::keys("swipe:hr:seen:{$user->id}:*");
        if (! empty($hrSeenKeys)) {
            Redis::del(...$hrSeenKeys);
        }

        Redis::del("points:{$user->id}");
    }
}
