<?php

use App\Jobs\ExpireJobPostingsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Check for expired job postings every 30 minutes
Schedule::job(new ExpireJobPostingsJob)->everyThirtyMinutes();
