# caprecorder

A headless screen recording library powered by Cap, built with Rust and exposed to Node.js via NAPI.

## Features

- 🎥 High-performance screen recording
- 🖥️ Support for both screen and window capture
- 🔊 System audio recording
- 🎯 Cross-platform (macOS, Windows, Linux)
- ⚡ Native Rust performance
- 🚀 Async/await API
- 🎮 Headless operation (no GUI required)
- ⏸️ Pause/resume functionality

## Installation

```bash
npm install caprecorder
```

## Quick Start

```javascript
const { CapRecorder, listAvailableScreens, hasScreenCapturePermission } = require('caprecorder');

async function recordScreen() {
  // Check permissions first
  if (!hasScreenCapturePermission()) {
    console.error('Screen capture permission required');
    return;
  }
  
  // List available screens
  const screens = listAvailableScreens();
  console.log('Available screens:', screens);
  
  const recorder = new CapRecorder();
  
  try {
    // Start recording
    await recorder.startRecording({
      outputPath: './recordings/my-recording',
      screenId: screens[0].id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('Recording started!');
    
    // Record for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Stop recording
    const outputPath = await recorder.stopRecording();
    console.log('Recording saved to:', outputPath);
    
  } catch (error) {
    console.error('Recording failed:', error);
    
    // Cleanup on error
    try {
      await recorder.cancelRecording();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

recordScreen();
```
    setTimeout(async () => {
      const outputPath = await recorder.stopRecording();
      console.log('Recording saved to:', outputPath);
    }, 10000);
    
  } catch (error) {
    console.error('Recording failed:', error);
  }
}

recordScreen();
```

## API Reference

### CapRecorder

The main recording class.

#### Constructor

```javascript
const recorder = new CapRecorder();
```

#### Methods

##### `startRecording(config: RecordingConfig): Promise<void>`

Starts a new recording session.

**Parameters:**
- `config.outputPath` (string): Directory where the recording will be saved
- `config.screenId` (number, optional): ID of screen to record
- `config.windowId` (number, optional): ID of window to record  
- `config.captureSystemAudio` (boolean, optional): Whether to capture system audio (default: false)
- `config.fps` (number, optional): Recording frame rate

**Note:** Either `screenId` or `windowId` must be specified.

##### `stopRecording(): Promise<string>`

Stops the current recording and returns the path to the saved recording.

##### `pauseRecording(): Promise<void>`

Pauses the current recording.

##### `resumeRecording(): Promise<void>`

Resumes a paused recording.

##### `cancelRecording(): Promise<void>`

Cancels the current recording without saving.

### Utility Functions

#### `listAvailableScreens(): ScreenInfo[]`

Returns a list of available screens for recording.

```javascript
const screens = listAvailableScreens();
// Returns: [{ id: 1, name: "Built-in Display", refreshRate: 60 }, ...]
```

#### `listAvailableWindows(): WindowInfo[]`

Returns a list of available windows for recording.

```javascript
const windows = listAvailableWindows();
// Returns: [{ id: 123, title: "Terminal", ownerName: "Terminal" }, ...]
```

#### `hasScreenCapturePermission(): boolean`

Checks if the application has permission to capture the screen.

```javascript
if (!hasScreenCapturePermission()) {
  console.log('Please grant screen recording permission');
}
```

## Examples

For more detailed examples, see the `examples.js` file or run:

```bash
# Run all examples
node examples.js

# Run specific examples
node examples.js screen   # Screen recording
node examples.js window   # Window recording  
node examples.js audio    # Audio recording
node examples.js pause    # Pause/resume example
```

### Screen Recording

```javascript
const { CapRecorder, listAvailableScreens } = require('caprecorder');

const recorder = new CapRecorder();
const screens = listAvailableScreens();

await recorder.startRecording({
  outputPath: './recordings/screen-recording',
  screenId: screens[0].id,
  captureSystemAudio: true, // Include system audio
  fps: 30
});

// Record for 30 seconds
setTimeout(async () => {
  const output = await recorder.stopRecording();
  console.log('Screen recording saved:', output);
}, 30000);
```

### Window Recording

```javascript
const { CapRecorder, listAvailableWindows } = require('caprecorder');

const recorder = new CapRecorder();
const windows = listAvailableWindows();

// Find a specific window or use the first one
const targetWindow = windows.find(w => w.title.includes('VS Code')) || windows[0];

await recorder.startRecording({
  outputPath: './recordings/window-recording',
  windowId: targetWindow.id,
  captureSystemAudio: true, // You can include audio for window recording
  fps: 30
});

// Record for 30 seconds
setTimeout(async () => {
  const output = await recorder.stopRecording();
  console.log('Window recording saved:', output);
}, 30000);
```

### Audio-Only Recording

```javascript
const recorder = new CapRecorder();
const screens = listAvailableScreens();

await recorder.startRecording({
  outputPath: './recordings/audio-only',
  screenId: screens[0].id,
  captureSystemAudio: true,
  fps: 1 // Very low fps to minimize video file size
});

// Record audio for 60 seconds
setTimeout(async () => {
  const output = await recorder.stopRecording();
  console.log('Audio recording saved:', output);
  // Check the segments folder for the .ogg audio file
}, 60000);
```

### Pause and Resume Recording

```javascript
const recorder = new CapRecorder();

await recorder.startRecording({
  outputPath: './recordings/pause-resume-test',
  screenId: screens[0].id,
  captureSystemAudio: false,
  fps: 30
});

// Record for 5 seconds
setTimeout(() => recorder.pauseRecording(), 5000);

// Resume after 2 seconds
setTimeout(() => recorder.resumeRecording(), 7000);

// Stop after another 5 seconds
setTimeout(() => recorder.stopRecording(), 12000);
```

## Testing

Run the test suite to verify functionality:

```bash
# Run all tests
node tests/index.js

# Run specific test suites
node tests/index.js basic     # Basic functionality tests
node tests/index.js audio     # Audio recording tests  
node tests/index.js advanced  # Advanced features and error handling
```

## Output Format

Recordings are saved in a structured format:

```
your-recording/
├── project-config.json    # Recording metadata
└── content/
    ├── cursors/           # Cursor data (if enabled)
    └── segments/
        └── segment-0/
            ├── display.mp4      # Video recording
            └── system_audio.ogg # Audio recording (if enabled)
```

### Key Points:

- **Video**: Saved as MP4 files with H.264 encoding
- **Audio**: Saved as OGG files with Opus encoding  
- **Multiple segments**: Long recordings may be split into multiple segments
- **Metadata**: `project-config.json` contains recording settings and timestamps

## Configuration Options

### Recording Configuration

```javascript
{
  outputPath: string,           // Required: Output directory path
  screenId?: number,            // Screen ID (from listAvailableScreens)
  windowId?: number,            // Window ID (from listAvailableWindows)  
  captureSystemAudio?: boolean, // Default: false
  fps?: number                  // Default: 30
}
```

### Audio Capture Notes

- **System Audio**: Captures all system audio output (music, notifications, etc.)
- **Window Recording**: Audio capture works for both screen and window recording
- **Permissions**: May require additional audio permissions on some systems
- **Quality**: Audio is encoded with Opus codec in OGG container

## Troubleshooting

### Common Issues

**Permission Denied**
```bash
# Check permissions
if (!hasScreenCapturePermission()) {
  console.log('Please grant screen recording permission in System Preferences');
}
```

**No Screens/Windows Found**
```javascript
const screens = listAvailableScreens();
const windows = listAvailableWindows();

if (screens.length === 0) console.log('No screens detected');
if (windows.length === 0) console.log('No windows available');
```

**Recording Timeout**
- Some longer recordings may timeout during stop operation
- Try shorter recording durations or use pause/resume functionality
- Check system resources and available disk space

**Audio Issues**
- Ensure system audio is playing during recording
- Check that `captureSystemAudio: true` is set
- Verify audio permissions in system settings

### FFmpeg Warnings

You may see warnings like:
```
[ogg @ 0x...] Timestamps are unset in a packet for stream 0
```

These are deprecation warnings from FFmpeg and don't affect functionality, but indicate areas for future improvement in the audio encoding pipeline.

## Performance Tips

- Use appropriate FPS settings (30 fps is usually sufficient)
- Consider audio-only recording for long sessions where video isn't needed
- Use pause/resume to avoid large continuous recordings
- Monitor disk space during long recordings

## Platform Support

- **macOS**: Full support with hardware acceleration
- **Windows**: Full support with hardware acceleration  
- **Linux**: Full support

## Requirements

- Node.js 16 or higher
- Screen recording permissions (will be requested on first use)
- Sufficient disk space for recordings
- For audio recording: system audio output

## License

MIT License - see LICENSE file for details.

## Contributing

This package is part of the larger Cap project. For contributing guidelines, please see the main [Cap repository](https://github.com/CapSoftware/Cap).

