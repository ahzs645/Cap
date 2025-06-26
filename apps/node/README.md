# @cap/recording

A headless screen recording library powered by Cap, built with Rust and exposed to Node.js via NAPI.

## Features

- 🎥 High-performance screen recording
- 🖥️ Support for both screen and window capture
- 🔊 System audio recording
- 🎯 Cross-platform (macOS, Windows, Linux)
- ⚡ Native Rust performance
- 🚀 Async/await API
- 🎮 Headless operation (no GUI required)

## Installation

```bash
npm install @cap/recording
```

## Quick Start

```javascript
const { CapRecorder, listAvailableScreens, hasScreenCapturePermission } = require('@cap/recording');

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

### Recording a Specific Window

```javascript
const { CapRecorder, listAvailableWindows } = require('@cap/recording');

async function recordWindow() {
  const windows = listAvailableWindows();
  
  // Find a specific window (e.g., by title)
  const targetWindow = windows.find(w => w.title.includes('Chrome'));
  
  if (!targetWindow) {
    console.error('Target window not found');
    return;
  }
  
  const recorder = new CapRecorder();
  
  await recorder.startRecording({
    outputPath: './recordings/window-recording',
    windowId: targetWindow.id,
    captureSystemAudio: true
  });
  
  // Record for 30 seconds
  setTimeout(async () => {
    const output = await recorder.stopRecording();
    console.log('Window recording saved:', output);
  }, 30000);
}
```

### Pause and Resume Recording

```javascript
const recorder = new CapRecorder();

await recorder.startRecording({
  outputPath: './recordings/pause-resume-test',
  screenId: screens[0].id
});

// Record for 5 seconds
setTimeout(() => recorder.pauseRecording(), 5000);

// Resume after 2 seconds
setTimeout(() => recorder.resumeRecording(), 7000);

// Stop after another 5 seconds
setTimeout(() => recorder.stopRecording(), 12000);
```

## Platform Support

- **macOS**: Full support with hardware acceleration
- **Windows**: Full support with hardware acceleration  
- **Linux**: Full support

## Requirements

- Node.js 16 or higher
- Screen recording permissions (will be requested on first use)

## License

MIT License - see LICENSE file for details.

## Contributing

This package is part of the larger Cap project. For contributing guidelines, please see the main [Cap repository](https://github.com/CapSoftware/Cap).
