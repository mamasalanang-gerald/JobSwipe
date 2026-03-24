<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ClearStaleRouteCache
 *
 * Render.com runs `php artisan route:cache` before our container's ENTRYPOINT
 * executes, so the cached routes may be incomplete (missing api.php routes).
 *
 * On the very first HTTP request after a deploy, this middleware detects the
 * poison flag file written at build time, clears the bad cache so Laravel falls
 * back to live route loading, then removes the flag so it never runs again.
 *
 * This adds ~0ms overhead on all requests except the very first one after deploy.
 */
class ClearStaleRouteCache
{
    /**
     * The flag file written during Docker build.
     * Its presence means the route cache was written by Render (bad).
     * Its absence means start.sh already cleaned up (good).
     */
    private const FLAG_FILE = '/tmp/render_precached_routes';

    public function handle(Request $request, Closure $next): Response
    {
        if (file_exists(self::FLAG_FILE)) {
            // Remove the bad route cache so Laravel loads routes from api.php live.
            // We intentionally do NOT re-run route:cache here — live loading is
            // correct and fast. start.sh will run route:cache properly on next deploy.
            @unlink(base_path('bootstrap/cache/routes-v7.php'));
            @unlink(base_path('bootstrap/cache/routes-v8.php')); // future-proof
            @unlink(self::FLAG_FILE);

            // Soft-redirect to the same URL so this request is handled with
            // clean (live) routes instead of the stale cache.
            return redirect($request->fullUrl(), 307);
        }

        return $next($request);
    }
}
