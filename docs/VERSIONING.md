# Semantic Versioning for Swarlehtaire

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (MAJOR.MINOR.PATCH).

## Automatic Version Bumping

Every push to the `main` branch automatically analyzes commit messages and bumps the version according to:

### Version Bump Rules

- **MAJOR** (X.0.0): Breaking changes
  - Commit messages starting with `BREAKING CHANGE:` or `major:`
  - Example: `BREAKING CHANGE: removed legacy card API`

- **MINOR** (0.X.0): New features (backward compatible)
  - Commit messages starting with `feat:`, `feature:`, or `minor:`
  - Messages containing "Add * feature", "Add * game", "Created *"
  - Example: `feat: add new solitaire game variant`

- **PATCH** (0.0.X): Bug fixes and minor changes (default)
  - Commit messages starting with `fix:`, `chore:`, `docs:`, etc.
  - Any commit not matching MAJOR or MINOR patterns
  - Example: `fix: correct Spider deck creation bug`

## Commit Message Conventions

Follow these commit message patterns to trigger correct version bumps:

```bash
# Patch bump (0.0.X)
git commit -m "fix: correct card placement logic"
git commit -m "chore: update dependencies"
git commit -m "docs: improve README"

# Minor bump (0.X.0)
git commit -m "feat: add Pyramid solitaire game"
git commit -m "feature: implement undo functionality"

# Major bump (X.0.0)
git commit -m "BREAKING CHANGE: rewrite game engine API"
git commit -m "major: remove deprecated methods"
```

## Docker Image Versioning

Docker images are automatically tagged with:
- Semantic version: `v1.2.3`
- Major.Minor: `v1.2`
- Major only: `v1`
- Latest (main branch): `latest`
- Branch name + SHA: `main-abc123`

Example for version `v1.2.3`:
```bash
ghcr.io/slmingol/swarlehtaire:v1.2.3
ghcr.io/slmingol/swarlehtaire:v1.2
ghcr.io/slmingol/swarlehtaire:v1
ghcr.io/slmingol/swarlehtaire:latest
```

## Workflow

1. **Make changes** to code
2. **Commit with conventional message**: `git commit -m "feat: add new feature"`
3. **Push to main**: `git push origin main`
4. **Automatic actions**:
   - GitHub Actions analyzes commit messages
   - Bumps version in `package.json`
   - Creates git tag (e.g., `v1.2.3`)
   - Triggers Docker build with version tags
   - Pushes to GitHub Container Registry

## Version Display

The app displays its version in the lower-right corner (translucent gray text). The version is:
- Read from `package.json` as the source of truth
- Embedded at build time
- Served via `/api/version` endpoint (if backend is available)

## Manual Version Management

To manually set a version (not recommended):

```bash
npm version patch  # 0.0.X
npm version minor  # 0.X.0
npm version major  # X.0.0
```

## Skipping CI

To push changes without triggering version bump:

```bash
git commit -m "docs: update README [skip ci]"
git push
```

The workflow ignores commits that modify `package.json`, `package-lock.json`, or `CHANGELOG.md` to prevent infinite loops.

## Checking Current Version

```bash
# From package.json
cat package.json | jq .version

# From git tags
git describe --tags --abbrev=0

# From Docker image
docker inspect ghcr.io/slmingol/swarlehtaire:latest | jq '.[0].Config.Labels."org.opencontainers.image.version"'
```

## Release Process

1. All releases are automated via GitHub Actions
2. Releases are created when version tags are pushed
3. Docker images are built and tagged for each release
4. Release notes can be generated from `CHANGELOG.md`

## Troubleshooting

### Version not bumping
- Check commit message follows convention
- Verify workflow ran successfully in GitHub Actions
- Ensure branch is `main` (workflow only runs on main branch)

### Docker image version mismatch
- Docker builds trigger on tag creation
- Check `docker.yml` workflow status
- Verify GHCR authentication is working

### Version display showing old version
- Clear browser cache
- Rebuild Docker image
- Check `/api/version` endpoint response
