<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email_enabled' => ['sometimes', 'boolean'],
            'push_enabled' => ['sometimes', 'boolean'],
            'channels' => ['sometimes', 'array'],
            'channels.*' => ['array'],
            'channels.*.email' => ['boolean'],
            'channels.*.push' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email_enabled.boolean' => 'Email enabled must be true or false',
            'push_enabled.boolean' => 'Push enabled must be true or false',
            'channels.array' => 'Channels must be an object',
            'channels.*.email.boolean' => 'Email preference must be true or false',
            'channels.*.push.boolean' => 'Push preference must be true or false',
        ];
    }
}
