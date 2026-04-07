<?php

namespace App\Http\Requests\Match;

use Illuminate\Foundation\Http\FormRequest;

class SendMatchMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'body.required' => 'Message body is required.',
            'body.max' => 'Message body cannot exceed 2000 characters.',
        ];
    }
}
