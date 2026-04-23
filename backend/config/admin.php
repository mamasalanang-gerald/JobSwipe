<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard Cache Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration defines cache TTL (Time To Live) values for admin
    | dashboard endpoints. All values are in seconds.
    |
    */

    'cache' => [
        // Dashboard statistics cache TTL (15 minutes)
        'dashboard_stats' => env('ADMIN_CACHE_DASHBOARD_STATS', 900),

        // Company lists cache TTL (5 minutes)
        'company_lists' => env('ADMIN_CACHE_COMPANY_LISTS', 300),

        // Revenue data cache TTL (1 hour)
        'revenue_data' => env('ADMIN_CACHE_REVENUE_DATA', 3600),

        // Trust events cache TTL (10 minutes)
        'trust_events' => env('ADMIN_CACHE_TRUST_EVENTS', 600),

        // Match statistics cache TTL (15 minutes)
        'match_stats' => env('ADMIN_CACHE_MATCH_STATS', 900),

        // Application statistics cache TTL (15 minutes)
        'application_stats' => env('ADMIN_CACHE_APPLICATION_STATS', 900),

        // User growth data cache TTL (15 minutes)
        'user_growth' => env('ADMIN_CACHE_USER_GROWTH', 900),

        // Recent activity cache TTL (5 minutes)
        'recent_activity' => env('ADMIN_CACHE_RECENT_ACTIVITY', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard Pagination
    |--------------------------------------------------------------------------
    |
    | Default pagination settings for admin endpoints.
    |
    */

    'pagination' => [
        // Default items per page
        'default_per_page' => 20,

        // Maximum items per page
        'max_per_page' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard Cache Key Prefixes
    |--------------------------------------------------------------------------
    |
    | Prefixes for Redis cache keys to organize admin data.
    |
    */

    'cache_keys' => [
        'dashboard_stats' => 'admin:dashboard:stats',
        'user_growth' => 'admin:dashboard:user_growth',
        'revenue_data' => 'admin:dashboard:revenue',
        'recent_activity' => 'admin:dashboard:activity',
        'company_list' => 'admin:companies:list',
        'company_details' => 'admin:company',
        'trust_low_companies' => 'admin:trust:low_companies',
        'match_stats' => 'admin:matches:stats',
        'application_stats' => 'admin:applications:stats',
        'subscription_revenue' => 'admin:subscriptions:revenue',
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Trust Score Thresholds
    |--------------------------------------------------------------------------
    |
    | Trust score thresholds for admin operations.
    |
    */

    'trust' => [
        // Companies below this score are considered "low trust"
        'low_trust_threshold' => 40,

        // Companies below this score cannot create job postings
        'job_posting_threshold' => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for webhook event management.
    |
    */

    'webhooks' => [
        // Maximum retry attempts before flagging for manual review
        'max_retry_attempts' => 3,
    ],
];
