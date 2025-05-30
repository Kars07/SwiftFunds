FROM php:8.1-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    && docker-php-ext-install pdo pdo_mysql mysqli

# Create directories
RUN mkdir -p /var/log/nginx /var/cache/nginx /etc/nginx/conf.d /var/log/supervisor /etc/supervisor/conf.d

# Copy nginx configuration and update for single container
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN sed -i 's/php:9000/127.0.0.1:9000/g' /etc/nginx/conf.d/default.conf

# Copy PHP configuration
COPY src/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Copy application source
COPY src/ /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Create a simple startup script instead of supervisor
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'php-fpm -D' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

# Start both services
CMD ["/start.sh"]