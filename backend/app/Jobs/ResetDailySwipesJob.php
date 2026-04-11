<?php

namespace App\Jobs;

use App\Models\PostgreSQL\ApplicantProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ResetDailySwipesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Reset all applicant daily_swipes_used to 0
        ApplicantProfile::query()->update([
            'daily_swipes_used' => 0,
            'swipe_reset_at' => now()->toDateString(),
        ]);

        \Log::info('Daily swipes reset completed', [
            'reset_at' => now()->toDateTimeString(),
        ]);
    }
}
