FROM php:8.1-fpm-alpine

WORKDIR /var/www/html

# Install mysqli extension
RUN docker-php-ext-install mysqli

# Install other useful extensions
RUN docker-php-ext-install pdo pdo_mysql

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html