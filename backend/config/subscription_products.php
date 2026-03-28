<?php

return [
    // Apple product IDs → internal mapping
    'apple' => [
        'com.jobswipe.verified.monthly' => ['tier' => 'basic', 'cycle' => 'monthly', 'type' => 'verification'],
        'com.jobswipe.pro.monthly' => ['tier' => 'pro', 'cycle' => 'monthly', 'type' => 'subscription'],
        'com.jobswipe.pro.yearly' => ['tier' => 'pro', 'cycle' => 'yearly', 'type' => 'subscription'],
    ],

    // Google product IDs → internal mapping
    'google' => [
        'verified_monthly' => ['tier' => 'basic', 'cycle' => 'monthly', 'type' => 'verification'],
        'pro_monthly' => ['tier' => 'pro', 'cycle' => 'monthly', 'type' => 'subscription'],
        'pro_yearly' => ['tier' => 'pro', 'cycle' => 'yearly', 'type' => 'subscription'],
    ],

    // Stripe price IDs → internal mapping
    'stripe' => [
        'price_basic_monthly' => ['tier' => 'basic', 'cycle' => 'monthly', 'type' => 'verification'],
        'price_pro_monthly' => ['tier' => 'pro', 'cycle' => 'monthly', 'type' => 'subscription'],
        'price_pro_yearly' => ['tier' => 'pro', 'cycle' => 'yearly', 'type' => 'subscription'],
    ],
];
