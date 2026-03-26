<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userName,
        public string $userRole,
    ) {}

    public function build(): self
    {
        $subject = $this->userRole === 'applicant'
            ? 'Welcome to JobSwipe - Start Swiping!'
            : 'Welcome to JobSwipe - Find Your Perfect Candidates!';

        return $this->subject($subject)
            ->view('emails.welcome')
            ->with([
                'userName' => $this->userName,
                'userRole' => $this->userRole,
                'dashboardUrl' => config('app.frontend_url').'/dashboard',
            ]);
    }
}
