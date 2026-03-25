<?php

namespace App\Jobs;

use App\Models\PostgreSQL\CompanyProfile;
use App\Models\PostgreSQL\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/*
    For debugging and correcting any drift in active_listings_count.
    It will log any discrepancies it finds and correct them in the database.

    php artisan tinker
    >>> \App\Jobs\ReconcileListingCountsJob::dispatchSync();
*/

class ReconcileListingCountsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function handle(): void
    {
        $correctedCount = 0;

        CompanyProfile::chunkById(100, function ($companies) use (&$correctedCount) {
            foreach ($companies as $company) {
                $actual = JobPosting::where('company_id', $company->id)
                    ->where('status', 'active')
                    ->count();

                if ($company->active_listings_count !== $actual) {
                    Log::warning("Listing count drift for company {$company->id}: stored={$company->active_listings_count}, actual={$actual}");

                    $company->update(['active_listings_count' => $actual]);
                    $correctedCount++;
                }
            }
        });

        if ($correctedCount > 0) {
            Log::info("ReconcileListingCountsJob corrected {$correctedCount} company listing counts");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical("ReconcileListingCountsJob failed permanently: {$exception->getMessage()}");
    }
}
