# Node.js Package Structure

This directory contains the Node.js bindings for Cap's recording functionality, allowing headless screen recording in Node.js applications.

## Overview

The `@cap/recording` package provides a high-performance, cross-platform screen recording library for Node.js applications. It's built on Cap's native Rust recording engine and exposed via NAPI (Node-API).

## Architecture

```
apps/node/
├── src/
│   └── lib.rs           # Rust NAPI bindings
├── package.json         # NPM package configuration
├── index.js            # JavaScript entry point
├── index.d.ts          # TypeScript definitions
├── test.js             # Basic test example
├── examples.js         # Comprehensive examples
├── build.rs            # Rust build script
├── Cargo.toml          # Rust dependencies
└── README.md           # Package documentation
```

## Key Features

- **Native Performance**: Built on Cap's high-performance Rust recording engine
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Headless Operation**: No GUI dependencies, perfect for servers and automation
- **Modern API**: Promise-based API with full TypeScript support
- **Flexible Recording**: Screen capture, window capture, with optional audio
- **Recording Controls**: Start, stop, pause, resume, and cancel operations

## Dependencies

The package depends on:
- Cap's core recording crates (`cap-recording`, `cap-media`)
- NAPI for Rust-to-Node.js bindings
- System dependencies (FFmpeg libraries)

## Building

```bash
# Install dependencies
npm install

# Build in debug mode
npm run build:debug

# Build in release mode  
npm run build

# Run tests
npm test

# Run comprehensive examples
npm run examples
```

## Integration with Cap Workspace

This package is part of the Cap monorepo and leverages:
- Shared Rust dependencies via Cargo workspace
- Common build and testing infrastructure
- Synchronized releases with the main Cap project

## Publishing

The package can be published independently or as part of Cap releases:

```bash
# Prepare for publishing
npm run prepublishOnly

# Publish to npm
npm publish
```

## Platform Support

The package supports the same platforms as the main Cap project:
- macOS (x86_64, Apple Silicon)
- Windows (x86_64)
- Linux (x86_64, ARM64)

Native binaries are built for each platform during the release process.
