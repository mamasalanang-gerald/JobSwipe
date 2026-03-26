<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class GenerateUploadUrlRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'file_name' => ['required', 'string', 'max:255'],
            'file_type' => ['required', 'string', 'max:100'],
            'file_size' => ['required', 'integer', 'min:1'],
            'upload_type' => ['required', 'in:image,document'],
        ];
    }
}
