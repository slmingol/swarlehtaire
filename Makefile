# Makefile for Swarlehtaire Docker operations

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
	docker compose build web

# Start production container
up:
	docker compose up -d web
	@echo "Swarlehtaire running at http://localhost:8080"

# Stop containers
down:
	docker compose down

# Start development server
dev:
	docker compose --profile dev up -d dev
	@echo "Development server running at http://localhost:4200"

# View logs
logs:
	docker compose logs -f

# Shell into container
shell:
	docker compose exec web sh

# Clean up
clean:
	docker compose down -v
	docker rmi swarlehtaire-web swarlehtaire-dev 2>/dev/null || true

# Rebuild from scratch
rebuild: clean
	docker compose build --no-cache web
	docker compose up -d web

# Build and smoke test
test: build
	docker compose up -d web
	@echo "Waiting for container to be healthy..."
	@timeout 60 sh -c 'until [ "$$(docker inspect --format='"'"'{{.State.Health.Status}}'"'"' swarlehtaire)" = "healthy" ]; do sleep 2; done'
	@echo "✓ Container is healthy"
	docker compose down
