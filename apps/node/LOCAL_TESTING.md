# Local Testing for Cap Node Package

## Quick Test

To test if the package builds on your current platform:

```bash
./test-builds-local.sh
```

This script will:
1. ✅ Check all required dependencies
2. 📦 Install npm dependencies
3. 🎯 Add the appropriate Rust target
4. 🔨 Build the native module
5. 📁 Show the generated binary

## What it checks

### macOS
- ✅ Rust/Cargo
- ✅ Node.js/npm
- ✅ pkg-config (from Homebrew)
- ✅ FFmpeg (from Homebrew)

### Linux
- ✅ Rust/Cargo  
- ✅ Node.js/npm
- ✅ System packages: pkg-config, libpipewire-0.3-dev, libasound2-dev, libpulse-dev, libssl-dev, libv4l-dev, libclang-dev, ffmpeg, libavcodec-dev, libavformat-dev, libavutil-dev, libswscale-dev, libswresample-dev, linux-libc-dev, build-essential

### Windows
- ✅ Rust/Cargo
- ✅ Node.js/npm
- ✅ Visual Studio Build Tools (not automatically checked)

## Expected Output

On success, you should see something like:
```
🎉 Local build test completed successfully for macOS (aarch64-apple-darwin)
```

And a generated `.node` file:
```
📁 Generated files:
-rwxr-xr-x@ 1 user staff 8241104 cap-node.darwin-arm64.node
```

## Troubleshooting

If the test fails, the script will provide platform-specific troubleshooting tips.

Common issues:
- **macOS**: Missing FFmpeg or pkg-config → `brew install ffmpeg pkg-config`
- **Linux**: Missing system packages → Install the packages listed above
- **Windows**: Missing Visual Studio Build Tools → Install from Microsoft

For detailed troubleshooting, see [BUILD.md](./BUILD.md).
