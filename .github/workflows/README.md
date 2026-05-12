# GitHub Actions Workflows

## Docker Build and Publish

The `docker.yml` workflow automatically builds and publishes Docker images to GitHub Container Registry (GHCR).

### Triggers

- **Push to main**: Builds and pushes with `main` tag
- **Tag push (v*)**: Builds and pushes with version tags
- **Pull requests**: Builds only (no push)
- **Manual**: Via workflow_dispatch

### Image Tags

Images are tagged with:
- `main` - Latest main branch
- `v1.0.0` - Full semver
- `v1.0` - Major.minor
- `v1` - Major version
- `sha-<commit>` - Specific commit

### Multi-platform

Builds for both `linux/amd64` and `linux/arm64`.

### Usage

```bash
# Pull latest
docker pull ghcr.io/slmingol/swarlehtaire:main

# Pull specific version
docker pull ghcr.io/slmingol/swarlehtaire:v0.1.0

# Use in docker-compose
services:
  web:
    image: ghcr.io/slmingol/swarlehtaire:latest
```
