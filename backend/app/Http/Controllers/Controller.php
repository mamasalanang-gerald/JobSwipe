<?php

namespace App\Http\Controllers;

<<<<<<< HEAD
use App\Support\ApiResponse;
=======
use Illuminate\Http\JsonResponse;
>>>>>>> cdeb7a8c4943047073e7bfce32d7e5ee962b5aa4
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
<<<<<<< HEAD
    use ApiResponse;
=======
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
>>>>>>> cdeb7a8c4943047073e7bfce32d7e5ee962b5aa4
}
