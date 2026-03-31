<?php

namespace App\Jobs;

use App\Mail\MatchNotificationMail;
use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\ApplicantProfile;
use App\Models\PostgreSQL\JobPosting;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendMatchNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $applicantId,
        private string $jobId,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $applicant = ApplicantProfile::findOrFail($this->applicantId);
        $job = JobPosting::with('company')->findOrFail($this->jobId);
        $user = $applicant->user;
        $mongoProfile = ApplicantProfileDocument::where('user_id', $user->id)->first();

        // Create in-app notification
        $notificationService->create(
            userId: $user->id,
            type: 'match_found',
            title: "🎉 You matched with {$job->company->company_name}!",
            body: "Great news! {$job->company->company_name} is interested in your application for {$job->title}",
            data: [
                'job_id' => $this->jobId,
                'company_id' => $job->company_id,
                'match_type' => 'company_interested',
            ]
        );

        // Send match notification email (respects user preferences)
        $notificationService->sendEmail(
            userId: $user->id,
            mailable: new MatchNotificationMail(
                applicantName: $mongoProfile->first_name,
                jobTitle: $job->title,
                companyName: $job->company->company_name,
                companyLogo: $job->company->logo_url ?? null,
                jobUrl: config('app.frontend_url').'/jobs/'.$this->jobId,
            ),
            type: 'match_found'
        );

        // Send push notification (respects user preferences)
        $notificationService->sendPush(
            userId: $user->id,
            type: 'match_found',
            title: "🎉 You matched with {$job->company->company_name}!",
            body: "They're interested in your application for {$job->title}",
            data: [
                'job_id' => $this->jobId,
                'company_id' => $job->company_id,
            ]
        );
    }
}
