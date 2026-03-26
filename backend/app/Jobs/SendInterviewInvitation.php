<?php

namespace App\Jobs;

use App\Mail\InterviewInvitationMail;
use App\Models\MongoDB\ApplicantProfileDocument;
use App\Models\PostgreSQL\ApplicantProfile;
use App\Models\PostgreSQL\JobPosting;
use App\Models\PostgreSQL\Notification;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendInterviewInvitation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $applicantId,
        private string $jobId,
        private string $message,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
        private string $message
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
            type: 'interview_invitation',
            title: "Interview Invitation from {$job->company->company_name}",
            body: "You've been invited to interview for {$job->title}",
            data: [
                'job_id' => $this->jobId,
                'company_id' => $job->company_id,
                'message' => $this->message,
            ],
        ]);

        Mail::to($user->email)->send(new InterviewInvitationMail(
            applicantName: $mongoProfile->first_name,
            jobTitle: $job->title,
            companyName: $job->company->company_name,
            message: $this->message,
            jobUrl: config('app.frontend.url').'/jobs/'.$this->jobId,
        ));

        // TODO: EXPO NOTIFICATIONS
    }
}
