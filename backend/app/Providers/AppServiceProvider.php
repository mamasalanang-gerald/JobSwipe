<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Singletons are added here as each Repository/Service class is implemented.
     * DO NOT register a class here until its file actually exists — Laravel will
     * throw a BindingResolutionException on every request if it can't resolve it.
     *
     * Uncomment each binding as you create the corresponding class:
     *
     * Phase 1 — Repositories (add as you build them):
     *   \App\Repositories\Redis\SwipeCacheRepository::class
     *   \App\Repositories\Mongo\SwipeHistoryRepository::class
     *   \App\Repositories\PostgreSQL\ApplicationRepository::class
     *   \App\Repositories\PostgreSQL\ApplicantProfileRepository::class
     *
     * Phase 2 — Services (add after their repository dependencies exist):
     *   \App\Services\SwipeService::class
     *   \App\Services\PointService::class
     *   \App\Services\DeckService::class
     *   \App\Services\InvitationService::class
     */
    public function register(): void
    {
        // -----------------------------------------------------------------
        // Repositories
        // Uncomment each line only after you have created the class file.
        // -----------------------------------------------------------------

        $this->app->singleton(\App\Repositories\Redis\SwipeCacheRepository::class);
        $this->app->singleton(\App\Repositories\MongoDB\SwipeHistoryRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\ApplicationRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\ApplicantProfileRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\CompanyProfileRepository::class);
        $this->app->singleton(\App\Repositories\Redis\OTPCacheRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\UserRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\JobPostingRepository::class);
        $this->app->singleton(\App\Repositories\PostgreSQL\NotificationRepository::class);
        $this->app->singleton(\App\Repositories\MongoDB\ApplicantProfileDocumentRepository::class);
        $this->app->singleton(\App\Repositories\MongoDB\CompanyProfileDocumentRepository::class);

        // -----------------------------------------------------------------
        // Services
        // Uncomment each line only after ALL constructor dependencies above
        // are already registered as singletons.
        // -----------------------------------------------------------------

        $this->app->singleton(\App\Services\SwipeService::class);
        $this->app->singleton(\App\Services\DeckService::class);
        $this->app->singleton(\App\Services\NotificationService::class);
        // $this->app->singleton(\App\Services\PointService::class);
        // $this->app->singleton(\App\Services\InvitationService::class);

        $this->app->singleton(\App\Services\OTPService::class);
        $this->app->singleton(\App\Services\ProfileCompletionService::class);
        $this->app->singleton(\App\Services\ProfileSocialLinksValidator::class);
        $this->app->singleton(\App\Services\ProfileOnboardingService::class);
        $this->app->singleton(\App\Services\ProfileService::class);
        $this->app->singleton(\App\Services\FileUploadService::class);
        $this->app->singleton(\App\Services\SubscriptionService::class);
        $this->app->singleton(\App\Services\TokenService::class);
        $this->app->singleton(\App\Services\AuthService::class);
        $this->app->singleton(\App\Services\UserDataCleanupService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // CRITICAL FIX: Disable route caching on Render.com
        // Render runs `php artisan route:cache` before our container starts,
        // caching routes before api.php is loaded. This causes all API routes to 404.
        // By setting routesAreCached to always return false, we force Laravel to
        // load routes from files on every request (negligible performance impact).
        if (app()->environment('production')) {
            app()->bind('router', function ($app) {
                $router = new \Illuminate\Routing\Router($app['events'], $app);

                // Override the routesAreCached method to always return false
                $router->macro('routesAreCached', function () {
                    return false;
                });

                return $router;
            });
        }
    }
}
