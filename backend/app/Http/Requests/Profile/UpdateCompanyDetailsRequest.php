<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyDetailsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['hr', 'company_admin'], true);
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:2000'],
            'industry' => ['required', 'string', 'max:100'],
            'company_size' => ['required', 'in:1-10,11-50,51-200,201-500,501-1000,1000+'],
            'founded_year' => ['nullable', 'integer', 'min:1800', 'max:'.now()->year],
            'website_url' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'array'],
            'social_links' => ['nullable', 'array'],
        ];
    }
}
