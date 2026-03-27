<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
    ) {
        Log::info('EmailVerificationMail: Mailable created', [
            'code_preview' => substr($code, 0, 2).'****',
            'queue_connection' => config('queue.default'),
        ]);
    }

    public function envelope(): Envelope
    {
        Log::info('EmailVerificationMail: Building envelope');

        return new Envelope(
            subject: 'Your JobSwipe Verification Code',
        );
    }

    public function content(): Content
    {
        Log::info('EmailVerificationMail: Building content');

        return new Content(
            view: 'email_verification_msg',
        );
    }
}
