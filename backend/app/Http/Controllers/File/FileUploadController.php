<?php

namespace App\Http\Controllers\File;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\GenerateUploadUrlRequest;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileUploadController extends Controller
{
    public function __construct(private FileUploadService $fileUploads) {}

    public function generateUploadUrl(GenerateUploadUrlRequest $request): JsonResponse
    {
        $result = $this->fileUploads->generatePresignedUrl(
            userId: (string) $request->user()->id,
            fileName: (string) $request->input('file_name'),
            fileType: (string) $request->input('file_type'),
            fileSize: (int) $request->input('file_size'),
            uploadType: (string) $request->input('upload_type'),
        );

        return $this->success(data: $result, message: 'Upload URL generated.');
    }

    public function confirmUpload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_url' => ['required', 'string', 'max:2000'],
        ]);

        $this->fileUploads->validateFileUrl((string) $validated['file_url']);

        return $this->success(data: [
            'file_url' => $validated['file_url'],
            'confirmed' => true,
        ], message: 'Upload confirmed.');
    }
}
