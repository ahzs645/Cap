#!/bin/bash

# test-builds-local.sh - Test builds locally before CI
# This script helps test builds on the current platform

set -e

cd "$(dirname "$0")"

echo "🧪 Testing local builds for Cap node package"
echo "============================================="

# Detect platform
PLATFORM=""
TARGET=""
case "$(uname -s)" in
    Darwin)
        PLATFORM="macOS"
        case "$(uname -m)" in
            x86_64) TARGET="x86_64-apple-darwin" ;;
            arm64) TARGET="aarch64-apple-darwin" ;;
            *) echo "❌ Unsupported macOS architecture: $(uname -m)"; exit 1 ;;
        esac
        ;;
    Linux)
        PLATFORM="Linux"
        case "$(uname -m)" in
            x86_64) TARGET="x86_64-unknown-linux-gnu" ;;
            *) echo "❌ Unsupported Linux architecture: $(uname -m)"; exit 1 ;;
        esac
        ;;
    MINGW*|MSYS*|CYGWIN*)
        PLATFORM="Windows"
        TARGET="x86_64-pc-windows-msvc"
        ;;
    *)
        echo "❌ Unsupported platform: $(uname -s)"
        exit 1
        ;;
esac

echo "📱 Platform: $PLATFORM"
echo "🎯 Target: $TARGET"
echo ""

# Check dependencies
echo "🔍 Checking dependencies..."

if command -v cargo >/dev/null 2>&1; then
    echo "✅ Rust/Cargo found: $(cargo --version)"
else
    echo "❌ Rust/Cargo not found. Install from https://rustup.rs/"
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found."
    exit 1
fi

# Platform-specific dependency checks
case "$PLATFORM" in
    macOS)
        if command -v pkg-config >/dev/null 2>&1; then
            echo "✅ pkg-config found: $(pkg-config --version)"
        else
            echo "❌ pkg-config not found. Install with: brew install pkg-config"
            exit 1
        fi
        
        if pkg-config --exists libavcodec; then
            echo "✅ FFmpeg found: $(pkg-config --modversion libavcodec)"
        else
            echo "❌ FFmpeg not found. Install with: brew install ffmpeg"
            exit 1
        fi
        ;;
    Linux)
        echo "🐧 Checking Linux dependencies..."
        
        MISSING_DEPS=()
        
        # Check for required packages
        for pkg in pkg-config libpipewire-0.3-dev libasound2-dev libpulse-dev libssl-dev libv4l-dev libclang-dev; do
            if ! dpkg -l | grep -q "^ii  $pkg "; then
                MISSING_DEPS+=("$pkg")
            fi
        done
        
        if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
            echo "✅ All Linux dependencies found"
        else
            echo "❌ Missing dependencies: ${MISSING_DEPS[*]}"
            echo "Install with: sudo apt-get install ${MISSING_DEPS[*]}"
            exit 1
        fi
        
        # Check for FFmpeg
        if pkg-config --exists libavcodec; then
            echo "✅ FFmpeg found: $(pkg-config --modversion libavcodec)"
        else
            echo "❌ FFmpeg not found. Install with: sudo apt-get install ffmpeg libavcodec-dev libavformat-dev libavutil-dev libswscale-dev libswresample-dev"
            exit 1
        fi
        ;;
    Windows)
        echo "🪟 Windows builds require Visual Studio Build Tools"
        echo "   Make sure you have the C++ build tools installed"
        ;;
esac

echo ""

# Install npm dependencies
echo "📦 Installing npm dependencies..."
if ! npm install; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi
echo "✅ npm dependencies installed"

# Add Rust target
echo "🎯 Adding Rust target: $TARGET"
if ! rustup target add "$TARGET"; then
    echo "❌ Failed to add Rust target"
    exit 1
fi
echo "✅ Rust target added"

# Set environment variables for build
export PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=1
export PKG_CONFIG_ALLOW_SYSTEM_LIBS=1

case "$PLATFORM" in
    Linux)
        export LIBCLANG_PATH="/usr/lib/llvm-14/lib"
        export BINDGEN_EXTRA_CLANG_ARGS="-I/usr/include/linux"
        ;;
    macOS)
        if command -v brew >/dev/null 2>&1; then
            export PKG_CONFIG_PATH="$(brew --prefix)/lib/pkgconfig:$(brew --prefix ffmpeg)/lib/pkgconfig"
            export LIBRARY_PATH="$(brew --prefix)/lib:$(brew --prefix ffmpeg)/lib"
            export CPATH="$(brew --prefix)/include:$(brew --prefix ffmpeg)/include"
        fi
        ;;
esac

# Build
echo "🔨 Building for target: $TARGET"
echo "Environment variables:"
echo "  PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=$PKG_CONFIG_ALLOW_SYSTEM_CFLAGS"
echo "  PKG_CONFIG_ALLOW_SYSTEM_LIBS=$PKG_CONFIG_ALLOW_SYSTEM_LIBS"
[ -n "$LIBCLANG_PATH" ] && echo "  LIBCLANG_PATH=$LIBCLANG_PATH"
[ -n "$BINDGEN_EXTRA_CLANG_ARGS" ] && echo "  BINDGEN_EXTRA_CLANG_ARGS=$BINDGEN_EXTRA_CLANG_ARGS"
[ -n "$PKG_CONFIG_PATH" ] && echo "  PKG_CONFIG_PATH=$PKG_CONFIG_PATH"
echo ""

if npx napi build --platform --release --target "$TARGET"; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Generated files:"
    ls -la *.node 2>/dev/null || echo "   No .node files found"
    echo ""
    echo "🎉 Local build test completed successfully for $PLATFORM ($TARGET)"
else
    echo "❌ Build failed"
    echo ""
    echo "🔧 Troubleshooting tips:"
    case "$PLATFORM" in
        macOS)
            echo "  - Make sure FFmpeg is installed: brew install ffmpeg"
            echo "  - Make sure pkg-config is installed: brew install pkg-config"
            echo "  - Try setting FFMPEG_DIR manually: export FFMPEG_DIR=\$(brew --prefix ffmpeg)"
            ;;
        Linux)
            echo "  - Make sure all dependencies are installed:"
            echo "    sudo apt-get install pkg-config libpipewire-0.3-dev libasound2-dev libpulse-dev libssl-dev libv4l-dev libclang-dev ffmpeg libavcodec-dev libavformat-dev libavutil-dev libswscale-dev libswresample-dev linux-libc-dev build-essential"
            echo "  - Make sure clang is available: which clang"
            echo "  - Check if V4L2 headers are available: ls /usr/include/linux/videodev2.h"
            ;;
        Windows)
            echo "  - Make sure Visual Studio Build Tools are installed"
            echo "  - Make sure Windows SDK is installed"
            ;;
    esac
    exit 1
fi
