<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct()
    {
        
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your JobSwipe Password Reset Code',
        );
    }

    
    public function content(): Content
    {
        return new Content(
            view: 'password_reset_msg',
        );
    }

  
    public function attachments(): array
    {
        return [];
    }
}
