#!/bin/bash

# Docker-based Linux cross-compilation script
set -e

echo "🐳 Building Linux binaries using Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not available${NC}"
    echo "Please install Docker to use this cross-compilation method"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${BLUE}Building Docker image for cross-compilation...${NC}"

# Build the Docker image
docker build -f Dockerfile.cross-build -t cap-node-cross-build .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

echo -e "${BLUE}Running cross-compilation in Docker...${NC}"

# Run the cross-compilation
docker run --rm -v $(pwd):/workspace cap-node-cross-build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cross-compilation completed successfully${NC}"
    echo -e "${BLUE}Built binaries:${NC}"
    ls -la *.node 2>/dev/null || echo "No .node files found"
else
    echo -e "${RED}❌ Cross-compilation failed${NC}"
    exit 1
fi
