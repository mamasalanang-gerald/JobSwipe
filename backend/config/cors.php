<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_WEB_URL', 'http://localhost:3000'),
        env('FRONTEND_MOBILE_URL', 'http://localhost:8080'),
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'Idempotency-Key'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,
];
