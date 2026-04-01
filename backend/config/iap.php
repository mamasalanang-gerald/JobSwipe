<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Apple In-App Purchase Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Apple App Store receipt verification.
    | The shared secret is used to verify receipts with Apple's servers.
    |
    */
    'apple' => [
        'shared_secret' => env('APPLE_IAP_SHARED_SECRET'),
        'production_url' => 'https://buy.itunes.apple.com/verifyReceipt',
        'sandbox_url' => 'https://sandbox.itunes.apple.com/verifyReceipt',
        'timeout' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Play Billing Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Google Play Store purchase verification.
    | The service account JSON file is used to authenticate with Google Play
    | Developer API.
    |
    */
    'google' => [
        'service_account_json' => env('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'),
        'package_name' => env('GOOGLE_PLAY_PACKAGE_NAME'),
        'timeout' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | IAP Product Catalog
    |--------------------------------------------------------------------------
    |
    | Centralized product definitions for subscriptions and swipe packs.
    | Each product includes platform-specific product IDs and pricing.
    |
    */
    'products' => [
        'pro_monthly' => [
            'type' => 'subscription',
            'tier' => 'pro',
            'billing_cycle' => 'monthly',
            'price' => 199.00,
            'currency' => 'PHP',
            'apple_product_id' => 'com.jobswipe.pro.monthly',
            'google_product_id' => 'pro_monthly',
            'stripe_price_id' => env('STRIPE_PRO_MONTHLY_PRICE_ID'),
        ],

        'swipes_5' => [
            'type' => 'swipe_pack',
            'quantity' => 5,
            'price' => 49.00,
            'currency' => 'PHP',
            'apple_product_id' => 'com.jobswipe.swipes.5',
            'google_product_id' => 'swipes_5',
        ],

        'swipes_10' => [
            'type' => 'swipe_pack',
            'quantity' => 10,
            'price' => 89.00,
            'currency' => 'PHP',
            'apple_product_id' => 'com.jobswipe.swipes.10',
            'google_product_id' => 'swipes_10',
        ],

        'swipes_15' => [
            'type' => 'swipe_pack',
            'quantity' => 15,
            'price' => 119.00,
            'currency' => 'PHP',
            'apple_product_id' => 'com.jobswipe.swipes.15',
            'google_product_id' => 'swipes_15',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | IAP System Configuration
    |--------------------------------------------------------------------------
    |
    | General configuration for the IAP system including idempotency TTL,
    | tier limits, and grace periods.
    |
    */
    'idempotency_ttl_seconds' => 86400, // 24 hours

    'free_tier_daily_limit' => 20,
    'pro_tier_daily_limit' => 999,

    'past_due_grace_period_days' => 7,
];
