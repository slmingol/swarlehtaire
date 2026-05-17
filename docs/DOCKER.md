# Swarlehtaire Docker Setup

Build and run Swarlehtaire in Docker containers.

## 🐳 Quick Start

### Production (pre-built image)

```bash
# Using Docker Compose (recommended)
docker compose up -d web

# Or using plain Docker
docker run -d -p 8080:80 ghcr.io/slmingol/swarlehtaire:latest
```

Access at **http://localhost:8080**

### Development (with hot reload)

```bash
# Start dev server with live reload
docker compose --profile dev up -d dev

# Access at http://localhost:4200
```

## 🛠️ Building from Source

### Build production image

```bash
# Build the Docker image
docker build -t swarlehtaire:local .

# Run the container
docker run -d -p 8080:80 swarlehtaire:local
```

### Build with Docker Compose

```bash
# Build and start
docker compose build web
docker compose up -d web
```

## 📦 Makefile Commands

For convenience, use the provided Makefile:

```bash
make build         # Build production image
make up            # Start production container
make down          # Stop containers
make dev           # Start development server
make logs          # View container logs
make shell         # Shell into running container
make clean         # Remove containers and images
```

## 🔧 Configuration

### Change Port

Edit `docker-compose.yml` or use:

```bash
docker run -d -p 9090:80 swarlehtaire:local
```

### Custom nginx Config

Edit `docker/nginx.conf` and rebuild:

```bash
docker compose build web
docker compose up -d web
```

## 📊 Container Details

### Production Image
- **Base:** nginx:alpine
- **Size:** ~50MB (optimized)
- **Port:** 80
- **Health Check:** Enabled (30s interval)

### Development Image  
- **Base:** node:22-alpine
- **Port:** 4200
- **Hot Reload:** Enabled
- **Volume Mounts:** Source code

## 🚀 Deployment

### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag swarlehtaire:local ghcr.io/slmingol/swarlehtaire:latest

# Push
docker push ghcr.io/slmingol/swarlehtaire:latest
```

### Docker Hub

```bash
docker tag swarlehtaire:local slmingol/swarlehtaire:latest
docker push slmingol/swarlehtaire:latest
```

## 📋 Health Check

The production container includes a health check:

```bash
docker inspect --format='{{.State.Health.Status}}' swarlehtaire
```

## 🐞 Troubleshooting

### View logs
```bash
docker compose logs -f web
```

### Shell into container
```bash
docker compose exec web sh
```

### Rebuild from scratch
```bash
docker compose down
docker compose build --no-cache web
docker compose up -d web
```

## 🔐 Security

The nginx configuration includes:
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Gzip compression
- Static asset caching
- Hidden file protection
