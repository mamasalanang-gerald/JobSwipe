<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        $payload = [
            'success' => true,
            'data' => $data,
            'message' => $message,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function error(string $code, string $message, int $status, array $errors = []): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'code' => $code,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    protected function validationError(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->error(
            code: 'VALIDATION_ERROR',
            message: $message,
            status: 422,
            errors: $errors
        );
    }
}
