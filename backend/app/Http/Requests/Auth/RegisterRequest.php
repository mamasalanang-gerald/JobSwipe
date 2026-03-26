<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Ensure this request expects JSON response
        $this->headers->set('Accept', 'application/json');
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:applicant,hr,company_admin'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'Role must be applicant, hr, or company_admin.',
            'password.min' => 'Password must be at least 8 characters.',
        ];
    }
}
