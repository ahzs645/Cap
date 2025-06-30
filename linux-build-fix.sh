#!/bin/bash
echo "🔧 Applying Linux build fixes..."

echo "✅ Linux build fixes have been applied to the following files:"
echo "  - crates/media/src/data.rs: Added 'where Self: Sized' to trait methods"
echo "  - crates/media/src/sources/audio_input.rs: Fixed duration_since call"
echo "  - crates/media/src/sources/screen_capture.rs: Added Linux stub for display_for_target"

echo "🏗️ Building with Linux stubs..."
cd apps/node

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cargo clean

# Build with verbose output to catch any remaining issues
echo "🔨 Building for Linux target..."
cargo build --release --target x86_64-unknown-linux-gnu --verbose

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Running npm build..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "🎉 Complete build successful!"
    else
        echo "❌ npm build failed. Check the output above."
        exit 1
    fi
else
    echo "❌ Cargo build failed. Check the output above for any remaining issues."
    echo "📝 Note: Make sure you have all Linux dependencies installed:"
    echo "  - libpipewire-0.3-dev"
    echo "  - libasound2-dev"
    echo "  - libxcb1-dev"
    echo "  - libxrandr-dev"
    echo "  - libdbus-1-dev"
    exit 1
fi
