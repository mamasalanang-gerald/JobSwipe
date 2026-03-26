<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MatchNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $applicantName,
        public string $jobTitle,
        public string $companyName,
        public ?string $companyLogo,
        public string $jobUrl,
    ) {}

    public function build(): self
    {
        return $this->subject("🎉 You matched with {$this->companyName}!")
            ->view('emails.match-notification')
            ->with([
                'applicantName' => $this->applicantName,
                'jobTitle' => $this->jobTitle,
                'companyName' => $this->companyName,
                'companyLogo' => $this->companyLogo,
                'jobUrl' => $this->jobUrl,
            ]);
    }
}
