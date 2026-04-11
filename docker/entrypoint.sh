#!/bin/sh
set -e

cd /var/www/html

# CRITICAL: Remove bootstrap cache FIRST before anything else
# This prevents stale service provider references from causing errors
rm -rf bootstrap/cache/*.php 2>/dev/null || true
rm -rf bootstrap/cache/packages.php 2>/dev/null || true
rm -rf bootstrap/cache/services.php 2>/dev/null || true

# Create necessary directories with proper permissions
mkdir -p storage/logs \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/app/public \
         bootstrap/cache
chmod -R 777 storage bootstrap
chown -R www-data:www-data storage bootstrap

# Install composer dependencies if vendor doesn't exist
if [ ! -f vendor/autoload.php ]; then
    echo "Installing composer dependencies..."
    composer install --no-scripts --no-interaction --prefer-dist
fi

# Regenerate composer autoload to ensure clean state
composer dump-autoload --optimize 2>/dev/null || true

# Check if we should run Horizon (for background worker service)
if [ "$RUN_HORIZON" = "true" ]; then
    echo "Starting Laravel Horizon..."
    php artisan horizon
else
    # Run Laravel development server (for web service)
    echo "Starting Laravel web server..."
    php artisan serve --host=0.0.0.0
fi
