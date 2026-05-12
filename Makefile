# Makefile for Swarlehtaire Docker operations

# Use podman if docker is not available
CONTAINER_CMD := $(shell command -v docker 2> /dev/null || echo podman)
COMPOSE_CMD := $(CONTAINER_CMD) compose

.PHONY: help build up down dev logs shell clean rebuild test

# Default target
help:
	@echo "Swarlehtaire Docker Commands:"
	@echo "  make build       - Build production Docker image"
	@echo "  make up          - Start production container"
	@echo "  make down        - Stop all containers"
	@echo "  make dev         - Start development server (hot reload)"
	@echo "  make logs        - View container logs"
	@echo "  make shell       - Shell into running container"
	@echo "  make clean       - Remove containers and images"
	@echo "  make rebuild     - Clean rebuild from scratch"
	@echo "  make test        - Build and smoke test"

# Build production image
build:
	$(COMPOSE_CMD) build web

# Start production container
up:
	$(COMPOSE_CMD) up -d web
	@echo "Swarlehtaire running at http://localhost:8080"

# Stop containers
down:
	$(COMPOSE_CMD) down

# Start development server
dev:
	$(COMPOSE_CMD) --profile dev up -d dev
	@echo "Development server running at http://localhost:4200"

# View logs
logs:
	$(COMPOSE_CMD) logs -f

# Shell into container
shell:
	$(COMPOSE_CMD) exec web sh

# Clean up
clean:
	$(COMPOSE_CMD) down -v
	$(CONTAINER_CMD) rmi swarlehtaire-web swarlehtaire-dev 2>/dev/null || true

# Rebuild from scratch
rebuild: clean
	$(COMPOSE_CMD) build --no-cache web
	$(COMPOSE_CMD) up -d web

# Build and smoke test
test: build
	$(COMPOSE_CMD) up -d web
	@echo "Waiting for container to be healthy..."
	@timeout 60 sh -c 'until [ "$$($(CONTAINER_CMD) inspect --format='"'"'{{.State.Health.Status}}'"'"' swarlehtaire)" = "healthy" ]; do sleep 2; done'
	@echo "✓ Container is healthy"
	$(COMPOSE_CMD) down
