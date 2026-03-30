<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'code' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'code.required' => 'Verification code is required.',
            'code.size' => 'Verification code must be 6 digits.',
            'code.regex' => 'Verification code must contain only numbers.',
            'password.required' => 'New password is required.',
            'password.min' => 'Password must be at least 8 characters.',
        ];
    }
}
