#!/bin/bash

# Build script for @cap/recording Node.js package

set -e

echo "Building @cap/recording for release..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Clean previous builds
echo "Cleaning previous builds..."
rm -f *.node

# Build in release mode
echo "Building native module..."
npm run build

# Run tests to ensure everything works
echo "Running tests..."
npm test

echo "✅ Build completed successfully!"
echo "Generated files:"
ls -la *.node 2>/dev/null || echo "No .node files found in current directory"

echo ""
echo "To publish:"
echo "  npm publish"
