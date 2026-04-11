PROJECT := tarbutrm
ENV     ?= dev
FILE    ?= backups/latest.sql

COMPOSE      := docker compose -p $(PROJECT)
COMPOSE_BASE := $(COMPOSE) -f docker-compose.yml
COMPOSE_DEV  := $(COMPOSE_BASE) -f docker-compose.dev.yml --env-file .env.dev
COMPOSE_PROD := $(COMPOSE_BASE) -f docker-compose.prod.yml --env-file .env.prod

ifeq ($(ENV),prod)
  COMPOSE_ENV := $(COMPOSE_PROD)
  DB_NAME     := tarbutrm_prod
else
  COMPOSE_ENV := $(COMPOSE_DEV)
  DB_NAME     := tarbutrm_dev
endif

.PHONY: run prod stop store load migrate seed logs shell _run-dev _run-prod

## Internal: Run dev environment (called by systemd service)
_run-dev:
	$(COMPOSE_DEV) up --build --renew-anon-volumes -d

## Internal: Run prod environment (called by systemd service)
_run-prod:
	$(COMPOSE_PROD) up --build --renew-anon-volumes -d

## Internal: Stop all containers (called by systemd service)
_stop:
	$(COMPOSE) down

## Start dev environment (runs as service, accessible even if shell disconnects)
run:
	sudo systemctl start tarbutrm-dev
	@echo ""
	@echo "Dev environment starting → http://$(shell hostname -I | awk '{print $$1}'):3001"
	@echo "Waiting for deployment (this may take up to 2 minutes)..."
	@bash -c 'for i in {1..120}; do \
		if curl -s -m 5 http://localhost:3001/api/health 2>/dev/null | grep -q "ok" && \
		   curl -s -m 5 http://localhost:3001/login 2>/dev/null | grep -q "form"; then \
			echo "✓ Dev environment is ready!"; exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "✗ Dev deployment failed - app not responding correctly"; \
	echo "Check logs: sudo systemctl status tarbutrm-dev"; \
	sudo systemctl stop tarbutrm-dev; \
	exit 1'

## Start production environment (runs as service, port 80)
prod:
	sudo systemctl start tarbutrm-prod
	@echo ""
	@echo "Production environment starting → http://$(shell hostname -I | awk '{print $$1}')"
	@echo "Waiting for deployment (this may take up to 2 minutes)..."
	@bash -c 'for i in {1..60}; do \
		if curl -s -m 5 http://localhost:3001/api/health 2>/dev/null | grep -q "ok" && \
		   curl -s -m 5 http://localhost:3001/login 2>/dev/null | grep -q "form"; then \
			echo "✓ Production environment is ready!"; exit 0; \
		fi; \
		sleep 2; \
	done; \
	echo "✗ Production deployment failed - app not responding correctly"; \
	echo "Check logs: sudo systemctl status tarbutrm-prod"; \
	sudo systemctl stop tarbutrm-prod; \
	exit 1'

## Stop all running containers
stop:
	sudo systemctl stop tarbutrm-dev tarbutrm-prod
	@echo "All services stopped."

## Dump DB to backups/backup_TIMESTAMP.sql (also symlinked as latest.sql).
## Defaults to dev DB. Use ENV=prod for production: make store ENV=prod
store:
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S) && \
	docker exec $(PROJECT)-db-1 pg_dump -U postgres $(DB_NAME) > backups/backup_$$TIMESTAMP.sql && \
	cd backups && ln -sf backup_$$TIMESTAMP.sql latest.sql && \
	echo "Backup saved → backups/backup_$$TIMESTAMP.sql ($(DB_NAME))"

## Restore DB from FILE (default: backups/latest.sql). Use ENV=prod for prod DB.
## Example: make load FILE=backups/backup_20260401.sql ENV=prod
load:
	@echo "WARNING: This will overwrite the $(DB_NAME) database."
	@echo "  Source: $(FILE)"
	@echo "  Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	@docker exec $(PROJECT)-db-1 psql -U postgres \
		-c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$(DB_NAME)';" \
		-c "DROP DATABASE IF EXISTS $(DB_NAME);" \
		-c "CREATE DATABASE $(DB_NAME);" > /dev/null
	@docker exec -i $(PROJECT)-db-1 psql -U postgres $(DB_NAME) < $(FILE)
	@echo "Restored $(DB_NAME) from $(FILE)"

## Run Prisma migrations. Use ENV=prod for prod DB.
migrate:
	$(COMPOSE_ENV) run --rm app npx prisma migrate deploy

## Run seed script. Use ENV=prod for prod DB (first deploy only).
seed:
	$(COMPOSE_ENV) run --rm app npx prisma db seed

## Tail app container logs
logs:
	$(COMPOSE_DEV) logs -f app

## Open shell in app container
shell:
	$(COMPOSE_DEV) exec app sh
