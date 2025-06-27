#!/bin/bash

# Build script for cross-platform native binaries
set -e

echo "🚀 Building native binaries for supported platforms..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to build for a specific target
build_target() {
    local target=$1
    local name=$2
    
    echo -e "${BLUE}Building for ${name} (${target})...${NC}"
    
    if npx napi build --platform --release --target "$target"; then
        echo -e "${GREEN}✅ Successfully built for ${name}${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to build for ${name}${NC}"
        return 1
    fi
}

# Current platform (should work by default)
echo -e "${YELLOW}Building for current platform...${NC}"
npm run build

# Detect current platform and build what we can
OS=$(uname -s)
ARCH=$(uname -m)

echo -e "${BLUE}Detected OS: $OS, Architecture: $ARCH${NC}"

case "$OS" in
    "Darwin")
        echo -e "${YELLOW}Building additional macOS targets...${NC}"
        # Try to build both Intel and Apple Silicon if possible
        if [ "$ARCH" = "arm64" ]; then
            build_target "x86_64-apple-darwin" "macOS Intel" || true
        else
            build_target "aarch64-apple-darwin" "macOS Apple Silicon" || true
        fi
        ;;
    "Linux")
        echo -e "${YELLOW}Building additional Linux targets...${NC}"
        # Try ARM64 Linux (more likely to work than musl variants)
        case "$ARCH" in
            "x86_64")
                build_target "aarch64-unknown-linux-gnu" "Linux ARM64" || true
                ;;
            "aarch64")
                build_target "x86_64-unknown-linux-gnu" "Linux x64" || true
                ;;
        esac
        ;;
    "MINGW"*|"MSYS"*|"CYGWIN"*)
        echo -e "${YELLOW}Building additional Windows targets...${NC}"
        # Try other Windows architectures
        case "$ARCH" in
            "x86_64")
                build_target "i686-pc-windows-msvc" "Windows x86" || true
                build_target "aarch64-pc-windows-msvc" "Windows ARM64" || true
                ;;
        esac
        ;;
esac

echo -e "${GREEN}🎉 Build complete!${NC}"
echo -e "${BLUE}Built binaries:${NC}"
ls -la *.node 2>/dev/null || echo "No .node files found"

echo ""
echo -e "${YELLOW}📝 Supported platforms:${NC}"
echo -e "${BLUE}  • Windows: x64, x86, ARM64${NC}"
echo -e "${BLUE}  • macOS: Intel x64, Apple Silicon ARM64${NC}"
echo -e "${BLUE}  • Linux: x64, ARM64 (GNU libc)${NC}"
echo ""
echo -e "${YELLOW}📝 Note: For complete cross-platform builds, use GitHub Actions${NC}"
