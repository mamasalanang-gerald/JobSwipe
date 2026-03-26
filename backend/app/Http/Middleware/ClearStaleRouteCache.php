<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ClearStaleRouteCache
 *
 * DEPRECATED: This middleware is no longer needed since we hide the artisan
 * file from Render's Laravel auto-detection. Keeping it as a safety net.
 *
 * Previously, Render ran `php artisan route:cache` before our ENTRYPOINT,
 * caching incomplete routes. Now we rename artisan → artisan.hidden during
 * build, preventing Render from detecting Laravel at all.
 */
class ClearStaleRouteCache
{
    public function handle(Request $request, Closure $next): Response
    {
        // No-op: artisan hiding prevents the issue entirely
        // Keeping this middleware registered for backward compatibility
        return $next($request);
    }
}
