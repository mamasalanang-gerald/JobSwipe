<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class FileUploadException extends Exception
{
    public function __construct(
        private readonly string $errorCode,
        string $message,
        private readonly int $statusCode = 400,
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'code' => $this->errorCode,
        ], $this->statusCode);
    }
}
