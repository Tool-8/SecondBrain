#!/bin/sh
set -e

if [ -d /var/www/html/storage ]; then
  mkdir -p /var/www/html/storage/framework/cache
  mkdir -p /var/www/html/storage/framework/sessions
  mkdir -p /var/www/html/storage/framework/views
  mkdir -p /var/www/html/storage/logs
fi

if [ -d /var/www/html/bootstrap/cache ]; then
  mkdir -p /var/www/html/bootstrap/cache
fi

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

exec "$@"
