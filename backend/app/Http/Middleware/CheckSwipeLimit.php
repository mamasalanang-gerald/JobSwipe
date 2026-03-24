<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSwipeLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'code' => 'UNAUTHENTICATED',
            ], 401);
        }

        $applicant = $user->applicantProfile;

        if (! $applicant) {
            return response()->json([
                'success' => false,
                'message' => 'Applicant profile not found',
                'code' => 'PROFILE_NOT_FOUND',
            ], 404);
        }

        if (! $applicant->hasSwipesRemaining()) {
            return response()->json([
                'success' => false,
                'message' => 'Daily swipe limit reached. Upgrade or purchase swipe packs.',
                'code' => 'SWIPE_LIMIT_REACHED',
                'data' => [
                    'daily_swipes_used' => $applicant->daily_swipes_used,
                    'daily_swipe_limit' => $applicant->daily_swipe_limit,
                    'extra_swipes_balance' => $applicant->extra_swipes_balance,
                ],
            ], 429);
        }

        return $next($request);
    }
}
