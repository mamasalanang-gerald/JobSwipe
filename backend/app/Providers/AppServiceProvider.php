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
     *   \App\Repositories\Postgres\ApplicationRepository::class
     *   \App\Repositories\Postgres\ApplicantProfileRepository::class
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

        // $this->app->singleton(\App\Repositories\Redis\SwipeCacheRepository::class);
        // $this->app->singleton(\App\Repositories\Mongo\SwipeHistoryRepository::class);
        // $this->app->singleton(\App\Repositories\Postgres\ApplicationRepository::class);
        // $this->app->singleton(\App\Repositories\Postgres\ApplicantProfileRepository::class);

        // -----------------------------------------------------------------
        // Services
        // Uncomment each line only after ALL constructor dependencies above
        // are already registered as singletons.
        // -----------------------------------------------------------------

        // $this->app->singleton(\App\Services\SwipeService::class);
        // $this->app->singleton(\App\Services\PointService::class);
        // $this->app->singleton(\App\Services\DeckService::class);
        // $this->app->singleton(\App\Services\InvitationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
