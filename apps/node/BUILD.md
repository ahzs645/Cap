# Cross-Platform Build Guide for Cap Node.js Package

This guide explains how to build native binaries for all supported platforms.

## Supported Platforms

The `@firstform/caprecorder` package supports:

### Operating Systems
- **macOS** (Darwin) - Intel x64 and Apple Silicon ARM64
- **Windows** - x64, x86 (32-bit), and ARM64  
- **Linux** - x64 and ARM64 (GNU and musl variants)
- **FreeBSD** - x64
- **Android** - ARM64 and ARM

### Architectures  
- **x64** (Intel/AMD 64-bit)
- **arm64** (Apple Silicon, ARM64)
- **ia32** (32-bit Intel)
- **arm** (32-bit ARM)

## Build Methods

### Method 1: GitHub Actions (Recommended)

The most reliable way to build for all platforms is using GitHub Actions CI/CD:

1. **Automatic builds**: The `.github/workflows/build-cross-platform.yml` workflow builds for all platforms
2. **Triggered on**: Push to main, PRs, or manual workflow dispatch
3. **Artifacts**: Binaries are uploaded as artifacts and can be downloaded

To trigger a build:
```bash
# Push to main branch
git push origin main

# Or manually trigger via GitHub UI
# Go to Actions → Build Cross-Platform Binaries → Run workflow
```

### Method 2: Local Development

For local development and testing:

```bash
# Build for current platform only
npm run build

# Try cross-platform build (limited by local environment)
npm run build:cross-platform

# Build specific platform groups
npm run build:windows    # Windows targets
npm run build:linux      # Linux targets  
npm run build:android    # Android targets
```

### Method 3: Platform-Specific Building

Build natively on each target platform for best results:

#### macOS
```bash
# Install Rust and Node.js
rustup target add x86_64-apple-darwin aarch64-apple-darwin
npm install
npm run build
```

#### Windows
```bash
# Install Rust and Node.js
rustup target add x86_64-pc-windows-msvc i686-pc-windows-msvc aarch64-pc-windows-msvc
npm install
npm run build
```

#### Linux
```bash
# Install Rust, Node.js, and build tools
sudo apt-get install build-essential pkg-config
rustup target add x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu
npm install
npm run build
```

### Method 4: Docker Cross-Compilation

For complex cross-compilation setups:

```bash
# Build using Docker
docker build -f Dockerfile.cross-build -t cap-cross-build .
docker run --rm -v $(pwd):/workspace cap-cross-build
```

## Package Structure

The package uses NAPI-RS for native bindings and includes:

```json
{
  "optionalDependencies": {
    "@firstform/caprecorder-win32-x64-msvc": "1.0.1",
    "@firstform/caprecorder-darwin-arm64": "1.0.1",
    "@firstform/caprecorder-linux-x64-gnu": "1.0.1",
    // ... more platform-specific packages
  }
}
```

## Runtime Detection

The package automatically detects the user's platform and loads the correct binary:

```javascript
// index.js automatically handles platform detection
const { platform, arch } = process;

// Loads the appropriate binary based on:
// - Operating system (darwin, linux, win32, etc.)
// - Architecture (x64, arm64, ia32, arm)
// - C library (GNU vs musl on Linux)
```

## Publishing

To publish with all platform binaries:

1. **Build all platforms** (via GitHub Actions)
2. **Download artifacts** and place in package directory
3. **Run prepublish script**:
   ```bash
   npm run prepublishOnly
   npm publish
   ```

## Troubleshooting

### Cross-Compilation Issues

Cross-compilation can fail due to:
- Missing system libraries
- Incompatible toolchains  
- Platform-specific dependencies

**Solutions:**
- Use GitHub Actions for reliable cross-platform builds
- Build natively on target platforms
- Use Docker with proper cross-compilation setup

### Common Errors

1. **`pkg-config` errors**: Missing development libraries
   ```bash
   # Linux
   sudo apt-get install pkg-config build-essential
   
   # macOS  
   brew install pkg-config
   ```

2. **Missing Rust targets**:
   ```bash
   rustup target add <target-triple>
   ```

3. **FFmpeg cross-compilation**: Complex multimedia dependencies
   - Use pre-built FFmpeg libraries
   - Build on native platforms
   - Use containerized builds

## Development Tips

1. **Test locally**: Always test your changes on the current platform first
2. **Use CI/CD**: Let GitHub Actions handle cross-platform builds
3. **Version management**: Keep all platform packages at the same version
4. **Binary size**: Release builds are optimized for size and performance

## Scripts Reference

- `npm run build` - Build for current platform
- `npm run build:debug` - Debug build for current platform  
- `npm run build:cross-platform` - Attempt cross-platform build
- `npm run build:windows` - Build Windows targets
- `npm run build:linux` - Build Linux targets
- `npm run build:android` - Build Android targets
- `npm run prepublishOnly` - Prepare for npm publishing
- `npm test` - Run tests with current binary

For more information, see the [NAPI-RS documentation](https://napi.rs/) and [Rust cross-compilation guide](https://rust-lang.github.io/rustup/cross-compilation.html).
