<?php

namespace App\Jobs;

use App\Models\PostgreSQL\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireJobPostingsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Retry up to 3 times if something fails.
     */
    public int $tries = 3;

    /**
     * Back off 60 seconds between retries.
     */
    public int $backoff = 60;

    public function handle(): void
    {
        $expiredCount = 0;
        $failedCount = 0;

        // Process in chunks to avoid memory issues if many postings expire at once
        JobPosting::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->chunkById(100, function ($jobs) use (&$expiredCount, &$failedCount) {
                foreach ($jobs as $job) {
                    try {
                        $job->update(['status' => 'expired']);
                        $job->company->decrement('active_listings_count');

                        // Remove from Meilisearch so applicants no longer see it
                        $job->unsearchable();

                        $expiredCount++;
                    } catch (\Throwable $e) {
                        $failedCount++;
                        Log::error("Failed to expire job posting {$job->id}: {$e->getMessage()}");
                    }
                }
            });

        //    Log::info("ExpireJobPostingsJob completed: {$expiredCount} expired, {$failedCount} failed");
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("ExpireJobPostingsJob failed permanently: {$exception->getMessage()}");
    }
}
