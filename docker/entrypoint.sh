#!/bin/sh
set -e

cd /var/www/html

# Install composer dependencies if vendor doesn't exist
if [ ! -f vendor/autoload.php ]; then
    echo "Installing composer dependencies..."
    composer install --no-scripts --no-interaction --prefer-dist
fi

# Run Laravel development server
php artisan serve --host=0.0.0.0
