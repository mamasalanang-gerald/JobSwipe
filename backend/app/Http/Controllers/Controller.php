<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    protected function error(string $code, string $message, int $status): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'code' => $code,
        ], $status);
    }
}
