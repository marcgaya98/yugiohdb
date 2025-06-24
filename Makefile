.PHONY: build up down logs ps restart shell dev prod clean

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.yml -f docker-compose.dev.yml

# Comandos básicos
build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

ps:
	$(DOCKER_COMPOSE) ps

restart:
	$(DOCKER_COMPOSE) restart

shell:
	$(DOCKER_COMPOSE) exec app sh

# Entornos específicos
dev:
	$(DOCKER_COMPOSE_DEV) up -d

prod:
	$(DOCKER_COMPOSE) up -d

# Limpieza
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

# Base de datos
db-shell:
	$(DOCKER_COMPOSE) exec db mysql -u $(shell grep DB_USER .env | cut -d= -f2) -p$(shell grep DB_PASSWORD .env | cut -d= -f2) $(shell grep DB_NAME .env | cut -d= -f2)

# Scripts
run-script:
	@read -p "Script name: " script; \
	$(DOCKER_COMPOSE) exec app node scripts/$$script.js
