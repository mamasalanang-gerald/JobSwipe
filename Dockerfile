# Production Dockerfile for Render deployment
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    postgresql-dev \
    libpq \
    libzip-dev \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    bcmath \
    mbstring \
    zip \
    pcntl

# Install MongoDB extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy backend files
COPY backend/ .

# Install PHP dependencies for production
RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist && \
    php artisan package:discover --ansi

# Create necessary directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache resources/views && \
    chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

# Copy Nginx configuration
COPY <<EOF /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    server {
        listen 8080;
        server_name _;
        root /var/www/html/public;
        index index.php;
        
        location / {
            try_files \$uri \$uri/ /index.php?\$query_string;
        }
        
        location ~ \.php$ {
            fastcgi_pass 127.0.0.1:9000;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
        
        location ~ /\.ht {
            deny all;
        }
    }
}
EOF

# Copy Supervisor configuration
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:php-fpm]
command=php-fpm
autostart=true
autorestart=true
stderr_logfile=/var/log/php-fpm.err.log
stdout_logfile=/var/log/php-fpm.out.log

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/nginx.err.log
stdout_logfile=/var/log/nginx.out.log
EOF

# Create startup script
COPY <<EOF /start.sh
#!/bin/sh
set -e

echo "=== Starting JobApp Backend ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until php artisan db:show 2>/dev/null; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "PostgreSQL is ready!"

# Clear all caches first
echo "Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Run database migrations
echo "Running PostgreSQL migrations..."
php artisan migrate --force || {
    echo "Migration failed! Checking database connection..."
    php artisan db:show
    exit 1
}

# Setup MongoDB collections
echo "Setting up MongoDB collections..."
php artisan mongo:setup || echo "MongoDB setup skipped (non-critical)"

# Cache configuration for production
echo "Caching configuration..."
php artisan config:cache
php artisan route:cache

# Only cache views if resources/views directory exists
if [ -d "resources/views" ]; then
    php artisan view:cache
fi

echo "=== Startup complete, starting services ==="

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /start.sh

# Expose port 8080 (required by Render)
EXPOSE 8080

# Start the application
CMD ["/start.sh"]