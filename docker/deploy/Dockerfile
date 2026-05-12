# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS frontend

WORKDIR /build

COPY src/package*.json ./
RUN npm ci

COPY src ./
RUN npm run build


FROM composer:2 AS vendor

WORKDIR /build

COPY src/composer*.json ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

COPY src ./
RUN composer dump-autoload --optimize


FROM php:8.4-fpm-bookworm AS runtime

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    unzip \
    gettext-base \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    libsqlite3-dev \
    && docker-php-ext-install \
        pdo \
        pdo_sqlite \
        intl \
        zip \
        mbstring \
        opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /build /var/www/html
COPY --from=frontend /build/public/build /var/www/html/public/build

COPY docker/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/deploy/entrypoint.sh /usr/local/bin/deploy-entrypoint

RUN chmod +x /usr/local/bin/deploy-entrypoint \
    && mkdir -p /run/nginx /data \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html /data

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/deploy-entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]