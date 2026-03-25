<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InterviewInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public string $applicantName,
        public string $jobTitle,
        public string $companyName,
        public string $message,
        public string $jobUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Interview Invitation from {$this->companyName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.interview-invitation',
            with: ([
                'applicantName' => $this->applicantName,
                'jobTitle' => $this->jobTitle,
                'companyName' => $this->companyName,
                'message' => $this->message,
                'jobUrl' => $this->jobUrl,
            ])
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
