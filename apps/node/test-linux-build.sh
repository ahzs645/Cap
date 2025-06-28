#!/bin/bash

# Linux Build Test Script for Cap Node Package
# Run this script to test the Linux build fixes

set -e  # Exit on any error

echo "🚀 Testing Linux Build Fixes for Cap Node Package"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "apps/node/Cargo.toml" ]; then
    echo "❌ Error: Please run this script from the Cap project root directory"
    exit 1
fi

# Backup original files
echo "📁 Creating backups..."
cp Cargo.toml Cargo.toml.backup 2>/dev/null || true
cp apps/node/Cargo.toml apps/node/Cargo.toml.backup

echo "🔧 Setting up environment..."

# Install required dependencies (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    echo "Installing Linux dependencies..."
    sudo apt-get update
    sudo apt-get install -y \
        build-essential \
        pkg-config \
        libclang-dev \
        libavcodec-dev \
        libavformat-dev \
        libavutil-dev \
        libavfilter-dev \
        libavdevice-dev \
        libswscale-dev \
        libswresample-dev \
        libasound2-dev \
        libpulse-dev
fi

# Set environment variables
export PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=1
export PKG_CONFIG_ALLOW_SYSTEM_LIBS=1

# Find and set libclang path
for path in /usr/lib/llvm-*/lib /usr/lib/x86_64-linux-gnu /usr/lib; do
    if ls $path/libclang.so* >/dev/null 2>&1; then
        export LIBCLANG_PATH=$path
        echo "✅ Found libclang at: $path"
        break
    fi
done

echo "🧪 Testing Approach 1: Patch v4l2-sys-mit in workspace"
echo "------------------------------------------------------"

# Add patch to workspace Cargo.toml
cat >> Cargo.toml << 'EOF'

# Patch to fix v4l2-sys-mit bindgen issues on Linux
[patch.crates-io]
bindgen = "0.69.4"
v4l2-sys-mit = "0.3.0"
EOF

echo "✅ Added patch to workspace Cargo.toml"

# Try building
cd apps/node
echo "🔨 Attempting to build with patch..."

if npm run build -- --target x86_64-unknown-linux-gnu; then
    echo "🎉 SUCCESS: Build completed with patch approach!"
    echo "✅ The v4l2-sys-mit patch resolved the issue."
    
    # Restore backups
    cd ../..
    cp Cargo.toml.backup Cargo.toml 2>/dev/null || true
    cp apps/node/Cargo.toml.backup apps/node/Cargo.toml
    
    echo ""
    echo "🎯 RECOMMENDATION: Add the patch to your workspace Cargo.toml:"
    echo ""
    echo "[patch.crates-io]"
    echo "bindgen = \"0.69.4\""
    echo "v4l2-sys-mit = \"0.3.0\""
    echo ""
    exit 0
else
    echo "❌ Patch approach failed. The issue likely requires forking scap."
fi

# Restore backups for next test
cd ../..
cp Cargo.toml.backup Cargo.toml 2>/dev/null || true
cp apps/node/Cargo.toml.backup apps/node/Cargo.toml

echo ""
echo "🧪 Testing Approach 2: Check if forked scap is needed"
echo "---------------------------------------------------"

# Check if scap dependency uses nokhwa with input-native
if grep -r "input-native" . --include="*.toml" | grep -v target; then
    echo "⚠️  Found input-native feature usage."
    echo "📋 This confirms that forking scap to disable input-native is needed."
    echo ""
    echo "🎯 RECOMMENDATION: Follow the scap fork approach:"
    echo "1. Fork the scap repository"
    echo "2. Disable the input-native feature for nokhwa on Linux"
    echo "3. Update your Cap project to use the forked scap"
    echo ""
    echo "See the detailed instructions in the generated artifacts."
else
    echo "🤔 No input-native feature found. The issue might be elsewhere."
fi

# Cleanup
rm -f Cargo.toml.backup apps/node/Cargo.toml.backup

echo ""
echo "🏁 Test completed. Check the output above for the recommended approach."