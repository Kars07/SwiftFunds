FROM php:8.1-fmp-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Create directories and set permissions
RUN mkdir -p /var/log/nginx \
    /var/cache/nginx \
    /var/lib/nginx \
    /var/lib/nginx/tmp \
    /var/log/supervisor \
    /etc/supervisor/conf.d \
    /run/nginx \
    && chown -R nginx:nginx /var/log/nginx /var/cache/nginx /var/lib/nginx /run/nginx

# Create main nginx configuration
RUN cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Copy and create nginx server configuration
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    index index.php index.html;
    server_name localhost;
    root /var/www/html;
    client_max_body_size 10000M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }
}
EOF

# Copy PHP configuration if it exists
COPY src/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Copy application source
COPY src/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create supervisor configuration
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
loglevel=info

[program:php-fpm]
command=php-fpm --nodaemonize
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/php-fpm.err.log
stdout_logfile=/var/log/supervisor/php-fpm.out.log
user=root

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nginx.err.log
stdout_logfile=/var/log/supervisor/nginx.out.log
user=root
EOF

# Test nginx configuration
RUN nginx -t

EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]