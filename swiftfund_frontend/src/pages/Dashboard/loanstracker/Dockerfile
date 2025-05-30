FROM php:8.1-fpm-alpine

# Install dependencies
RUN apk add --no-cache nginx supervisor mysql-client \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Create necessary directories
RUN mkdir -p /var/log/nginx /run/nginx /var/log/supervisor

# Create nginx config inline
RUN cat > /etc/nginx/http.d/default.conf << 'EOF'
server {
    listen 80;
    root /var/www/html;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
EOF

# Copy application
COPY src/ /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Create supervisor config
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true

[program:php-fpm]
command=php-fpm --nodaemonize
autorestart=true

[program:nginx]
command=nginx -g "daemon off;"
autorestart=true
EOF

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]