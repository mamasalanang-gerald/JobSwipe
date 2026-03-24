#!/bin/sh
set -e

cd /var/www/html

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

# Clear cached config to pick up new view.php configuration
php artisan config:clear
php artisan config:cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Check if we should run Horizon (for background worker service)
if [ "$RUN_HORIZON" = "true" ]; then
    echo "Starting Laravel Horizon..."
    php artisan horizon
else
    # Run Laravel development server (for web service)
    echo "Starting Laravel web server..."
    php artisan serve --host=0.0.0.0
fi
