<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:applicant, hr, company_admin'],
            'email' => ['required', 'email:rfc, dns', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
        ];
    }

    public function messages(): array
    {
        return [
            'role_in' => 'Role must be applicant, hr, or company_admin.',
        ];
    }
}
