<?php

use App\Jobs\ExpireJobPostingsJob;
use App\Jobs\ResetDailySwipesJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Check for expired job postings every 30 minutes
Schedule::job(new ExpireJobPostingsJob)->everyThirtyMinutes();
// Schedule daily swipe reset at midnight Philippine Time (UTC+8)
Schedule::job(new ResetDailySwipesJob)
    ->dailyAt('00:00')
    ->timezone('Asia/Manila')
    ->name('reset-daily-swipes')
    ->withoutOverlapping();
