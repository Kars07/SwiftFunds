FROM php:8.1-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Create directories for nginx
RUN mkdir -p /var/log/nginx /var/cache/nginx /etc/nginx/conf.d /var/log/supervisor

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy PHP configuration
COPY src/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Copy application source
COPY src/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Create supervisor configuration
RUN echo -e "[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:php-fpm]\n\
command=php-fpm\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/php-fpm.err.log\n\
stdout_logfile=/var/log/supervisor/php-fpm.out.log\n\
\n\
[program:nginx]\n\
command=nginx -g 'daemon off;'\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/supervisor/nginx.err.log\n\
stdout_logfile=/var/log/supervisor/nginx.out.log" > /etc/supervisor/conf.d/supervisord.conf

# Update nginx.conf to work without separate PHP container
RUN sed -i 's/php:9000/127.0.0.1:9000/g' /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]