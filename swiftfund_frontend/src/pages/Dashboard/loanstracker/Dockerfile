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
RUN echo "[supervisord]" > /etc/supervisor/conf.d/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "user=root" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "logfile=/var/log/supervisor/supervisord.log" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "pidfile=/var/run/supervisord.pid" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:php-fpm]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=php-fpm" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "stderr_logfile=/var/log/supervisor/php-fpm.err.log" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "stdout_logfile=/var/log/supervisor/php-fpm.out.log" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:nginx]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=nginx -g \"daemon off;\"" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autostart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "stderr_logfile=/var/log/supervisor/nginx.err.log" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "stdout_logfile=/var/log/supervisor/nginx.out.log" >> /etc/supervisor/conf.d/supervisord.conf

# Update nginx.conf to work without separate PHP container
RUN sed -i 's/php:9000/127.0.0.1:9000/g' /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]