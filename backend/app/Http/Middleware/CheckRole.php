<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Unauthenticated',
                'code' => 'UNAUTHENTICATED',
            ], 401);
        }

        if ($roles !== [] && !in_array($user->role, $roles, true)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'You are not allowed to access this resource.',
                'code' => 'UNAUTHORIZED',
            ], 403);
        }

        return $next($request);
    }
}
