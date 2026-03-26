<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicantSkillsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'applicant';
    }

    public function rules(): array
    {
        return [
            'skills' => ['required', 'array', 'min:1'],
            'skills.*.name' => ['required', 'string', 'max:100'],
            'skills.*.level' => ['nullable', 'in:beginner,intermediate,advanced,expert'],
            'skills.*.years' => ['nullable', 'integer', 'min:0', 'max:50'],
        ];
    }
}
