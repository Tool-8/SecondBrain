#!/bin/sh
set -eu

cd /var/www/html

export PORT="${PORT:-8080}"

export APP_NAME="${APP_NAME:-SecondBrain}"
export APP_ENV="${APP_ENV:-production}"
export APP_DEBUG="${APP_DEBUG:-false}"
export APP_URL="${APP_URL:-http://localhost:${PORT}}"

export DB_CONNECTION="${DB_CONNECTION:-sqlite}"
export DB_DATABASE="${DB_DATABASE:-/data/database.sqlite}"

export SESSION_DRIVER="${SESSION_DRIVER:-database}"
export CACHE_STORE="${CACHE_STORE:-database}"
export QUEUE_CONNECTION="${QUEUE_CONNECTION:-database}"

export LOG_CHANNEL="${LOG_CHANNEL:-stack}"
export LOG_STACK="${LOG_STACK:-single}"
export LOG_LEVEL="${LOG_LEVEL:-info}"

export BROADCAST_CONNECTION="${BROADCAST_CONNECTION:-log}"
export FILESYSTEM_DISK="${FILESYSTEM_DISK:-local}"

export MAIL_MAILER="${MAIL_MAILER:-log}"
export MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS:-hello@example.com}"
export MAIL_FROM_NAME="${MAIL_FROM_NAME:-${APP_NAME}}"

export LLM_BASE_URL="${LLM_BASE_URL:-}"
export LLM_API_KEY="${LLM_API_KEY:-}"
export LLM_MODEL="${LLM_MODEL:-}"

if [ -z "${APP_KEY:-}" ]; then
    APP_KEY="$(php artisan key:generate --show)"
    export APP_KEY
fi

mkdir -p /data
touch "$DB_DATABASE"

mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

cat > .env <<EOF
APP_NAME=${APP_NAME}
APP_ENV=${APP_ENV}
APP_KEY=${APP_KEY:-}
APP_DEBUG=${APP_DEBUG}
APP_URL=${APP_URL}

APP_LOCALE=${APP_LOCALE:-en}
APP_FALLBACK_LOCALE=${APP_FALLBACK_LOCALE:-en}
APP_FAKER_LOCALE=${APP_FAKER_LOCALE:-en_US}

LOG_CHANNEL=${LOG_CHANNEL}
LOG_STACK=${LOG_STACK}
LOG_LEVEL=${LOG_LEVEL}

DB_CONNECTION=${DB_CONNECTION}
DB_DATABASE=${DB_DATABASE}

SESSION_DRIVER=${SESSION_DRIVER}
SESSION_LIFETIME=${SESSION_LIFETIME:-120}
SESSION_ENCRYPT=${SESSION_ENCRYPT:-false}
SESSION_PATH=${SESSION_PATH:-/}
SESSION_DOMAIN=${SESSION_DOMAIN:-null}

CACHE_STORE=${CACHE_STORE}
QUEUE_CONNECTION=${QUEUE_CONNECTION}
BROADCAST_CONNECTION=${BROADCAST_CONNECTION}
FILESYSTEM_DISK=${FILESYSTEM_DISK}

MAIL_MAILER=${MAIL_MAILER}
MAIL_HOST=${MAIL_HOST:-127.0.0.1}
MAIL_PORT=${MAIL_PORT:-2525}
MAIL_USERNAME=${MAIL_USERNAME:-null}
MAIL_PASSWORD=${MAIL_PASSWORD:-null}
MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-null}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS}
MAIL_FROM_NAME="${MAIL_FROM_NAME}"

VITE_APP_NAME="${APP_NAME}"

LLM_BASE_URL=${LLM_BASE_URL}
LLM_API_KEY=${LLM_API_KEY}
LLM_MODEL=${LLM_MODEL}
EOF

chown -R www-data:www-data /data storage bootstrap/cache

php artisan storage:link || true
php artisan migrate --force

php artisan optimize:clear
php artisan config:cache
php artisan view:cache

envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"