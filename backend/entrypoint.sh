#!/bin/sh

cd /var/www/html

# Install composer dependencies if vendor doesn't exist
if [ ! -d vendor ]; then
    echo "Installing composer dependencies..."
    composer config process-timeout 1800
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Run Laravel development server
php artisan serve --host=0.0.0.0
