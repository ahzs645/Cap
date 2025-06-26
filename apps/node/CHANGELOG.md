# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-XX

### Added
- Initial release of @cap/recording Node.js package
- CapRecorder class for headless screen recording
- Support for screen and window capture
- System audio recording support
- Cross-platform compatibility (macOS, Windows, Linux)
- Async/await API with TypeScript support
- Utility functions for listing available screens and windows
- Permission checking functionality
- Pause, resume, and cancel recording capabilities
- High-performance native Rust implementation via NAPI

### Features
- **Screen Recording**: Capture full screens or specific windows
- **Audio Recording**: Optional system audio capture
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **High Performance**: Native Rust implementation for optimal performance
- **Modern API**: Promise-based API with full TypeScript support
- **Permission Management**: Built-in permission checking
- **Flexible Control**: Start, stop, pause, resume, and cancel recordings
