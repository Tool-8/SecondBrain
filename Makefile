UID := $(shell id -u)
GID := $(shell id -g)

BASE_COMPOSE = UID=$(UID) GID=$(GID) docker compose -f docker-compose.yml
DEV_COMPOSE = UID=$(UID) GID=$(GID) docker compose -f docker-compose.yml -f docker-compose.dev.yml
PROD_COMPOSE = UID=$(UID) GID=$(GID) docker compose -f docker-compose.yml -f docker-compose.prod.yml

up:
	$(DEV_COMPOSE) up -d --build

down:
	$(DEV_COMPOSE) down

dev:
	$(DEV_COMPOSE) up -d --build

prod:
	$(PROD_COMPOSE) up -d --build

build:
	$(DEV_COMPOSE) build

bash:
	$(DEV_COMPOSE) exec app sh

logs:
	$(DEV_COMPOSE) logs -f

ps:
	$(DEV_COMPOSE) ps

test:
	$(DEV_COMPOSE) exec app php artisan test

lint:
	$(DEV_COMPOSE) exec app ./vendor/bin/pint --test
	$(DEV_COMPOSE) exec vite npm run lint
	$(DEV_COMPOSE) exec vite npm run format:check

format:
	$(DEV_COMPOSE) exec app ./vendor/bin/pint
	$(DEV_COMPOSE) exec vite npm run format

npm-install:
	$(DEV_COMPOSE) exec vite npm install

composer-install:
	$(DEV_COMPOSE) exec app composer install
