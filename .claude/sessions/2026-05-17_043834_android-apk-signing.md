# Session: Android APK Signing Implementation
**Date:** 2026-05-17  
**Start:** ~02:00 UTC  
**End:** ~08:30 UTC  
**Duration:** ~6.5 hours

## Objective
Enable signed Android APK builds for installation on physical devices (Pixel phone).

## Problem
Tauri-generated Android builds were unsigned, preventing installation on devices outside developer mode.

## Solution Implemented
Successfully configured GitHub Actions workflow to inject signing configuration into Tauri's generated Gradle Kotlin DSL build files.

### Key Challenges & Resolutions

1. **Groovy vs Kotlin DSL Syntax**
   - Initial attempts used Groovy syntax (`.gradle`)
   - Tauri generates Kotlin DSL (`.gradle.kts`) requiring different syntax
   - Solution: Used Kotlin syntax (`create()`, `getByName()`, `val`)

2. **YAML Multi-line Script Escaping**
   - Complex sed commands with special chars broke YAML parsing
   - Solution: Base64-encoded Python script embedded in workflow

3. **Import Ordering in Kotlin DSL**
   - Imports must precede code that references them
   - Initial approach inserted imports AFTER keystore loading code
   - Solution: Combined imports + code in single insertion block with proper ordering

4. **Duplicate Import Detection**
   - Script initially added imports unconditionally
   - Tauri's template already included `import java.util.Properties`
   - Solution: Check for existing imports before adding

5. **Keystore File Path**
   - Initial path was wrong (app subdir vs android root)
   - Solution: Decode keystore to `gen/android/` directory, reference as `../keystore.jks`

### Technical Implementation

**Modified Files:**
- `.github/workflows/app_android.yml` - Added signing configuration injection
- `.github/workflows/version-bump.yml` - Added GitHub release creation

**Key Components:**
1. Setup step creates `keystore.properties` from GitHub secrets
2. Python script modifies `gen/android/app/build.gradle.kts`:
   - Adds missing Java imports (`FileInputStream`)
   - Inserts keystore loading code after imports
   - Adds `signingConfigs` block in `android {}` section
   - References signing config in release buildType
3. Decode base64 keystore to correct location
4. Upload signed APKs to GitHub release

### Build Iterations
- **~15 failed builds** debugging various syntax/path/ordering issues
- **Final success:** v1.3.17 build 25985336140

## Results

### ✅ Delivered
- 4 signed APK files published to v1.3.17 release:
  - `app-arm64-release.apk` (13.6 MB) - **Target for Pixel**
  - `app-arm-release.apk` (12.3 MB)
  - `app-x86_64-release.apk` (13.9 MB)
  - `app-x86-release.apk` (13.9 MB)

### Installation
```bash
# Direct download URL
https://github.com/slmingol/swarlehtaire/releases/download/v1.3.17/app-arm64-release.apk

# Or via adb
curl -L -o swarlehtaire.apk https://github.com/slmingol/swarlehtaire/releases/download/v1.3.17/app-arm64-release.apk
adb install swarlehtaire.apk
```

## Additional Work Completed

1. **CORS Headers for Pangolin Proxy**
   - Added `Access-Control-Allow-Origin` header to nginx.conf
   - Commit: 12fdcd1
   - Enables pangolin-authenticated access to web app

2. **UI Cleanup: mah→tile Rebranding**
   - Renamed all `mah-` prefixed IDs/animations to `tile-` prefix
   - Cleaned up vestiges of mahjong terminology
   - Commit: 49b6cf4

3. **Docker Build Fixes**
   - Disabled ARM64 builds to avoid QEMU emulation issues
   - Added proper SHA tagging for Docker images
   - Commit: a048933

4. **CI/CD Improvements**
   - Upgraded Node.js to v24 across workflows
   - Fixed AAB file upload handling
   - Automated GitHub release creation in version-bump workflow

## Lessons Learned

1. **Kotlin DSL requires explicit imports** - Unlike Groovy, can't rely on implicit java.* imports
2. **YAML heredocs are fragile** - Base64 encoding avoids quoting/escaping hell
3. **Tauri directory structure varies** - Check for both `app/` and `mah/` subdirectories
4. **Gradle error messages are precise** - Line numbers in `.kts` files are accurate
5. **Iterative debugging workflow** - commit → push → delete tag → retag → watch build

## Remaining Tasks

- [ ] Deploy Docker image with CORS headers to production
- [ ] Test APK installation on Pixel phone
- [ ] Verify signed APKs work correctly on device

## Repository State
- **Branch:** main at 0db779d
- **Latest Tag:** v1.3.17
- **Clean:** No uncommitted changes
- **Status:** Production-ready signed APKs available
