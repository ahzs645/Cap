# Cross-Platform Build Guide for Cap Node.js Package

This guide explains how to build native binaries for all supported platforms.

## Supported Platforms

The `@firstform/caprecorder` package supports the most common and reliable platforms:

### Operating Systems
- **macOS** (Darwin) - Intel x64 and Apple Silicon ARM64
- **Windows** - x64
- **Linux** - x64 (GNU libc)

### Architectures  
- **x64** (Intel/AMD 64-bit)
- **arm64** (Apple Silicon - macOS only)

**Note**: We focus on the most reliable and commonly used platforms. Additional platforms like Windows ARM64, Linux ARM64, and specialized variants can be added as demand grows and build infrastructure improves.

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

### Method 2: Docker-based Linux Cross-compilation

For building Linux binaries on macOS/Windows using Docker:

```bash
# Build Linux x86_64 binary using Docker
npm run build:linux-docker

# This will:
# 1. Build a Docker image with cross-compilation tools
# 2. Install ALSA and other Linux dependencies
# 3. Compile the native binary for x86_64-unknown-linux-gnu
# 4. Output the binary to the current directory
```

Prerequisites:
- Docker installed and running
- Sufficient disk space for the build image

### Method 3: Local Development

For local development and testing:

```bash
# Test build on current platform (recommended first step)
./test-builds-local.sh

# Build for current platform only
npm run build

# Try cross-platform build (limited by local environment)
npm run build:cross-platform

# Build specific platform groups
npm run build:windows    # Windows targets
npm run build:linux      # Linux targets  
npm run build:android    # Android targets
```

### Method 4: Platform-Specific Building

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
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  pkg-config \
  libpipewire-0.3-dev \
  libasound2-dev \
  libpulse-dev \
  libjack-jackd2-dev \
  libssl-dev

rustup target add x86_64-unknown-linux-gnu aarch64-unknown-linux-gnu
npm install
npm run build
```

**Important**: Linux builds require PipeWire, V4L2, and FFmpeg development libraries for audio/video capture. If you get build errors, make sure all dependencies are installed:

```bash
sudo apt-get install -y \
  pkg-config \
  libpipewire-0.3-dev \
  libasound2-dev \
  libpulse-dev \
  libjack-jackd2-dev \
  libssl-dev \
  libv4l-dev \
  libclang-dev \
  ffmpeg \
  libavcodec-dev \
  libavformat-dev \
  libavutil-dev \
  libswscale-dev \
  libswresample-dev \
  linux-libc-dev \
  build-essential
```

### Method 5: Docker Cross-Compilation

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
    "@cap/node-win32-x64-msvc": "workspace:*",
    "@cap/node-darwin-x64": "workspace:*",
    "@cap/node-darwin-arm64": "workspace:*",
    "@cap/node-linux-x64-gnu": "workspace:*"
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
   sudo apt-get install pkg-config build-essential libpipewire-0.3-dev
   
   # macOS  
   brew install pkg-config
   ```

2. **`libspa-sys` errors on Linux**: Missing PipeWire development libraries
   ```bash
   sudo apt-get install libpipewire-0.3-dev libasound2-dev libpulse-dev
   ```

3. **FFmpeg not found (macOS)**:
   ```
   error: failed to run custom build command for `ffmpeg-sys-next`
   ```
   **Solution:**
   ```bash
   brew install ffmpeg pkg-config
   export PKG_CONFIG_PATH="$(brew --prefix)/lib/pkgconfig:$(brew --prefix ffmpeg)/lib/pkgconfig"
   ```

4. **V4L2 bindgen errors (Linux)**:
   ```
   error: failed to run custom build command for `v4l2-sys-mit`
   ```
   **Solution:**
   ```bash
   sudo apt-get install libv4l-dev libclang-dev linux-libc-dev
   export LIBCLANG_PATH="/usr/lib/llvm-14/lib"
   export BINDGEN_EXTRA_CLANG_ARGS="-I/usr/include/linux"
   ```

5. **Missing Rust targets**:
   ```bash
   rustup target add <target-triple>
   ```

6. **Cross-compilation failures**: 
   - Use GitHub Actions for reliable cross-platform builds
   - Build natively on target platforms
   - Some combinations (like musl cross-compilation) require complex setups

### Environment Variables

Set these for better cross-platform compatibility:

```bash
# Always set these
export PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=1
export PKG_CONFIG_ALLOW_SYSTEM_LIBS=1

# Linux-specific (for bindgen issues)
export LIBCLANG_PATH="/usr/lib/llvm-14/lib"
export BINDGEN_EXTRA_CLANG_ARGS="-I/usr/include/linux"

# macOS-specific (if brew paths aren't detected)
export PKG_CONFIG_PATH="$(brew --prefix)/lib/pkgconfig:$(brew --prefix ffmpeg)/lib/pkgconfig"
export LIBRARY_PATH="$(brew --prefix)/lib:$(brew --prefix ffmpeg)/lib"
export CPATH="$(brew --prefix)/include:$(brew --prefix ffmpeg)/include"
```

## Development Tips

1. **Test locally**: Always test your changes on the current platform first
2. **Use CI/CD**: Let GitHub Actions handle cross-platform builds
3. **Version management**: Keep all platform packages at the same version
4. **Binary size**: Release builds are optimized for size and performance

## Scripts Reference

- `npm run build` - Build for current platform
- `npm run build:debug` - Debug build for current platform  
- `npm run build:cross-platform` - Attempt cross-platform build
- `npm run build:windows` - Build Windows targets (x64, x86, ARM64)
- `npm run build:linux` - Build Linux targets (x64, ARM64)
- `npm run build:macos` - Build macOS targets (Intel, Apple Silicon)
- `npm run prepublishOnly` - Prepare for npm publishing
- `npm test` - Run tests with current binary

For more information, see the [NAPI-RS documentation](https://napi.rs/) and [Rust cross-compilation guide](https://rust-lang.github.io/rustup/cross-compilation.html).
