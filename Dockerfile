# Production Dockerfile for Render deployment
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    curl git zip unzip postgresql-dev libpq libzip-dev \
    oniguruma-dev autoconf g++ make nginx supervisor

RUN docker-php-ext-install pdo pdo_pgsql bcmath mbstring zip pcntl

RUN pecl install mongodb && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/ .

RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist && \
    php artisan package:discover --ansi

# Write a flag file that survives into the running container.
# ClearStaleRouteCache middleware checks for this on the first request and
# nukes any route cache that Render wrote before our ENTRYPOINT ran.
RUN touch /tmp/render_precached_routes

RUN mkdir -p storage/logs storage/framework/cache/data \
    storage/framework/sessions storage/framework/views \
    bootstrap/cache resources/views && \
    chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache

COPY <<EOF /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on; tcp_nopush on; tcp_nodelay on;
    keepalive_timeout 65; types_hash_max_size 2048;
    
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
        
        location ~ /\.ht { deny all; }
    }
}
EOF

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

COPY <<EOF /start.sh
#!/bin/sh
set -e

echo "=== Starting JobApp Backend ==="

# Remove stale caches from Render's pre-start hook.
# The middleware also handles this on first request as a fallback,
# but clearing here means even the health check gets clean routes.
echo "Clearing Render pre-cached routes..."
rm -f /var/www/html/bootstrap/cache/routes-*.php
rm -f /var/www/html/bootstrap/cache/config.php

if [ "\$SKIP_MIGRATIONS" != "true" ]; then
    echo "Waiting for PostgreSQL..."
    RETRY_COUNT=0; MAX_RETRIES=30
    until php artisan db:show 2>/dev/null || [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; do
        echo "  not ready (\$RETRY_COUNT/\$MAX_RETRIES)..."
        sleep 2; RETRY_COUNT=\$((RETRY_COUNT + 1))
    done
    
    if [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; then
        echo "WARNING: PostgreSQL timeout, skipping migrations"
    else
        echo "PostgreSQL ready."
        
        php artisan config:clear 2>/dev/null || true
        php artisan cache:clear  2>/dev/null || true
        php artisan route:clear  2>/dev/null || true
        php artisan view:clear   2>/dev/null || true
        
        echo "Running migrations..."
        php artisan migrate --force || { php artisan db:show; exit 1; }
        
        echo "Setting up MongoDB..."
        php artisan mongo:setup || echo "WARNING: MongoDB setup non-critical, continuing"
        
        echo "Re-caching with correct routes..."
        php artisan config:cache
        php artisan route:cache
        
        ls -la /var/www/html/bootstrap/cache/routes-*.php 2>/dev/null \
            && echo "Route cache OK." || echo "WARNING: No route cache written"
        
        [ -d resources/views ] && php artisan view:cache || true
        
        # Clear the poison flag — middleware won't need to intervene
        rm -f /tmp/render_precached_routes
        echo "Cleared render_precached_routes flag."
    fi
else
    echo "SKIP_MIGRATIONS=true — skipping."
fi

echo "=== Startup complete ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /start.sh

EXPOSE 8080

ENTRYPOINT ["/start.sh"]
