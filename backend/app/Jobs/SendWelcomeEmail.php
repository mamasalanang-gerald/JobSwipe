<?php

namespace App\Jobs;

use App\Mail\WelcomeMail;
use App\Models\PostgreSQL\User;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $userId,
    ) {}

    public function handle(NotificationService $notificationService): void
    {
        $user = User::findOrFail($this->userId);

        // Determine user name based on role
        $userName = $user->role === 'applicant'
            ? ($user->applicantProfile?->first_name ?? 'there')
            : ($user->companyProfile?->company_name ?? 'there');

        // Send welcome email (respects user preferences)
        $notificationService->sendEmail(
            userId: $user->id,
            mailable: new WelcomeMail(
                userName: $userName,
                userRole: $user->role,
            ),
            type: 'welcome'
        );
    }
}
