# Semantic Versioning Implementation Summary

## What Was Added

### 1. GitHub Actions Workflows

#### version-bump.yml
- **Automatically analyzes commit messages** on every push to main
- **Bumps version** in package.json based on commit patterns:
  - `feat:`, `feature:` → MINOR bump (0.X.0)
  - `fix:`, `chore:`, `docs:` → PATCH bump (0.0.X)
  - `BREAKING CHANGE:`, `major:` → MAJOR bump (X.0.0)
- **Creates git tags** (e.g., v1.2.3)
- **Skips CI loops** by ignoring commits that modify package.json

#### docker.yml (updated)
- **Builds Docker images** when tags are pushed
- **Tags images** with multiple formats:
  - Semantic version: `v1.0.0`
  - Major.minor: `v1.0`
  - Major only: `v1`
  - Latest: `latest` (for main branch)
  - SHA: `main-abc123`
- **Pushes to GitHub Container Registry** (ghcr.io)
- **Multi-platform builds** (amd64 + arm64) for tagged releases

#### cleanup-images.yml
- **Runs weekly** (Sundays at 2 AM UTC)
- **Cleans up old**:
  - Workflow runs (retain 7 days, minimum 3)
  - Build artifacts (7 days old)
  - Container images (keep last 5 versions)
  - Caches
  - Releases (keep last 10, delete > 90 days old)

### 2. Version Display Component

**VersionDisplayComponent** in lower-right corner:
- Shows version number (e.g., "v1.0.0")
- Translucent gray text, non-intrusive
- Tries to fetch from `/api/version` endpoint
- Falls back to hardcoded version if API unavailable

### 3. Documentation

**VERSIONING.md**:
- Complete guide to semantic versioning
- Commit message conventions
- Docker image tagging strategy
- Manual version management
- Troubleshooting tips

### 4. Version Bump

Updated package.json from `0.1.0` → `1.0.0` (app is feature-complete with 7 games)

## Next Steps - When You Push

When you push to GitHub with `git push origin main --tags`:

1. **Version Bump Workflow** (version-bump.yml):
   - Will see your `feat:` commit
   - Will bump version from 1.0.0 → 1.1.0 (minor bump)
   - Will create tag `v1.1.0`
   - Will push tag automatically

2. **Docker Build Workflow** (docker.yml):
   - Triggered by the new tag
   - Builds Docker image
   - Tags as:
     - `ghcr.io/slmingol/swarlehtaire:v1.1.0`
     - `ghcr.io/slmingol/swarlehtaire:v1.1`
     - `ghcr.io/slmingol/swarlehtaire:v1`
     - `ghcr.io/slmingol/swarlehtaire:latest`
   - Pushes to GitHub Container Registry

3. **App Shows Version**:
   - After rebuild, lower-right corner shows "v1.1.0"

## Commit Message Examples

```bash
# Patch bump (1.0.X)
git commit -m "fix: correct card placement bug"
git commit -m "chore: update dependencies"

# Minor bump (1.X.0)
git commit -m "feat: add new card back design"
git commit -m "feature: implement undo functionality"

# Major bump (X.0.0)
git commit -m "BREAKING CHANGE: rewrite game state API"
```

## Local Testing

To test locally with the new version display:

```bash
# Build production version
npm run build:prod

# Serve with Docker
docker-compose up

# Or use local dev server
npm start
```

The version display will show in the lower-right corner at http://localhost:4200

## Notes

- Initial tag **v1.0.0** was created locally
- When you push with `--tags`, both workflows will run
- The version-bump workflow will see `feat:` and create v1.1.0
- Docker images will be built for both v1.0.0 and v1.1.0
- All future pushes will automatically bump version based on commit messages
