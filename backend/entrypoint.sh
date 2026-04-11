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
    composer config process-timeout 1800
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Clear all caches - don't cache config in development
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Run Laravel development server
php artisan serve --host=0.0.0.0
