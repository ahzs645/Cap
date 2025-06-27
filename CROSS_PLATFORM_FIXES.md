# Cross-Platform Build Fixes Summary

This document summarizes the fixes applied to resolve cross-platform compilation issues for the Cap Node.js package.

## Issues Addressed

### 1. macOS Build Issues (x86_64 and aarch64)

**Problem**: `Unable to find libclang: "couldn't find any valid shared libraries matching: ['libclang.dylib']"`

**Root Cause**: The `coreaudio-sys` crate (dependency of `cpal`) uses `bindgen` which requires `libclang` to generate Rust bindings from C headers.

**Solutions Applied**:
- ✅ Updated GitHub Actions workflow to install LLVM via Homebrew
- ✅ Added `LIBCLANG_PATH` environment variable setup
- ✅ Enhanced build.rs to automatically detect and set libclang paths
- ✅ Created setup script that handles dependency installation
- ✅ Added validation script to check environment before building

### 2. Windows Build Issues (x86_64)

**Problem**: 
```
Could not run PKG_CONFIG_ALLOW_SYSTEM_LIBS=1 PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=1 pkg-config --libs --cflags libavutil
The pkg-config command could not be found.
```

**Root Cause**: Windows doesn't have native pkg-config and FFmpeg development libraries by default.

**Solutions Applied**:
- ✅ Updated GitHub Actions workflow to install vcpkg and FFmpeg
- ✅ Added Windows-specific cargo configuration for static linking
- ✅ Enhanced build.rs with Windows-specific setup
- ✅ Created automated setup script for vcpkg and FFmpeg installation
- ✅ Added proper environment variable configuration

### 3. Linux Build Issues (x86_64)

**Problem**: `feature edition2024 is required`

**Root Cause**: Some crates were using Rust edition 2024 which requires nightly Cargo.

**Solutions Applied**:
- ✅ Updated cursor-capture crate from edition 2024 to 2021
- ✅ Updated displays crate from edition 2024 to 2021
- ✅ Enhanced Linux dependency installation in CI
- ✅ Added proper libclang path detection for various Linux distributions

## Files Created/Modified

### New Files Created:
1. `/apps/node/.cargo/config.toml` - Platform-specific cargo configuration
2. `/apps/node/scripts/setup-deps.js` - Automated dependency installation
3. `/apps/node/scripts/validate-env.js` - Environment validation
4. Build fixes and improvements

### Files Modified:
1. `/.github/workflows/build-cross-platform.yml` - Enhanced CI with proper dependency setup
2. `/apps/node/build.rs` - Platform-specific build configuration
3. `/apps/node/package.json` - Added validation and setup scripts
4. `/apps/node/build-cross-platform.sh` - Enhanced with dependency setup
5. `/apps/node/README.md` - Added comprehensive troubleshooting section
6. `/apps/node/BUILD.md` - Enhanced with platform-specific instructions
7. `/crates/cursor-capture/Cargo.toml` - Fixed edition compatibility
8. `/crates/displays/Cargo.toml` - Fixed edition compatibility
9. `/crates/audio/Cargo.toml` - Added feature flags for optional dependencies

## Key Improvements

### 1. Automated Dependency Management
- Scripts automatically detect and install required dependencies
- Platform-specific package manager detection (brew, apt, yum, dnf, vcpkg)
- Environment validation before building

### 2. Enhanced Error Handling
- Better error messages with specific instructions
- Validation scripts that check prerequisites
- Fallback paths for common installation locations

### 3. Improved Documentation
- Comprehensive troubleshooting guide in README
- Platform-specific build instructions in BUILD.md
- Clear error messages and solutions

### 4. Robust CI/CD
- Platform-specific dependency installation in GitHub Actions
- Proper environment variable setup for all platforms
- Static linking configuration for Windows

## Platform-Specific Solutions

### macOS
```bash
# Dependencies
brew install ffmpeg pkg-config llvm

# Environment
export LIBCLANG_PATH="$(brew --prefix llvm)/lib"
export PKG_CONFIG_PATH="$(brew --prefix)/lib/pkgconfig"
```

### Windows
```powershell
# Install vcpkg and FFmpeg
git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
C:\vcpkg\bootstrap-vcpkg.bat
C:\vcpkg\vcpkg.exe install ffmpeg:x64-windows-static

# Environment
set VCPKG_ROOT=C:\vcpkg
set FFMPEG_DIR=C:\vcpkg\installed\x64-windows-static
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential pkg-config libclang-dev \
  ffmpeg libavcodec-dev libavformat-dev libavutil-dev

# Environment
export LIBCLANG_PATH=/usr/lib/llvm-14/lib
```

## Usage

### For Developers
```bash
# Validate environment
npm run validate

# Build with automatic setup
npm run build

# Build for specific platform
npm run build:macos    # or build:windows, build:linux
```

### For CI/CD
The GitHub Actions workflow now handles all platform-specific setup automatically.

## Testing

To test the fixes:

1. **Local Development**:
   ```bash
   cd apps/node
   npm run validate  # Check environment
   npm run build     # Build with setup
   ```

2. **CI/CD**: 
   - Push to main branch or create PR
   - GitHub Actions will build for all platforms
   - Artifacts will be available for download

## Future Maintenance

1. **Dependency Updates**: The setup scripts may need updates when FFmpeg or other dependencies change
2. **New Platforms**: Additional platforms can be added by extending the setup and validation scripts
3. **Version Compatibility**: Monitor Rust edition compatibility for future updates

This comprehensive fix ensures reliable cross-platform builds for macOS (Intel/Apple Silicon), Windows (x64), and Linux (x64).
