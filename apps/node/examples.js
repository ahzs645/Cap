const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');

/**
 * Simple examples showing how to use Cap Recording
 */

// Example 1: Basic screen recording
async function recordScreen() {
  console.log('📺 Recording screen...');
  
  // Check permissions
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission required');
    return;
  }
  
  // Get available screens
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('❌ No screens available');
    return;
  }
  
  console.log(`Using screen: ${screens[0].name}`);
  
  const recorder = new CapRecorder();
  
  try {
    // Start recording
    await recorder.startRecording({
      outputPath: './recordings/screen-example',
      screenId: screens[0].id,
      captureSystemAudio: true, // Include system audio
      fps: 30
    });
    
    console.log('🎬 Recording started! Recording for 5 seconds...');
    console.log('(Do something on your screen now)');
    
    // Record for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Stop recording
    const outputPath = await recorder.stopRecording();
    console.log(`✅ Recording saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Recording failed:', error.message);
    
    // Cleanup on error
    try {
      await recorder.cancelRecording();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Example 2: Window recording
async function recordWindow() {
  console.log('🪟 Recording window...');
  
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission required');
    return;
  }
  
  // Get available windows
  const windows = listAvailableWindows();
  if (windows.length === 0) {
    console.error('❌ No windows available');
    return;
  }
  
  // Show available windows
  console.log('Available windows:');
  windows.slice(0, 5).forEach((window, i) => {
    console.log(`  ${i + 1}. "${window.title}" by ${window.ownerName}`);
  });
  
  // Pick the first suitable window
  const targetWindow = windows.find(w => 
    w.title.length > 0 && 
    !w.title.toLowerCase().includes('menubar')
  ) || windows[0];
  
  console.log(`Recording: "${targetWindow.title}"`);
  
  const recorder = new CapRecorder();
  
  try {
    await recorder.startRecording({
      outputPath: './recordings/window-example',
      windowId: targetWindow.id,
      captureSystemAudio: true, // You can include audio for window recording too
      fps: 30
    });
    
    console.log('🎬 Recording started! Recording for 5 seconds...');
    console.log('(Interact with the target window now)');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const outputPath = await recorder.stopRecording();
    console.log(`✅ Recording saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Recording failed:', error.message);
    
    try {
      await recorder.cancelRecording();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Example 3: Audio-only recording
async function recordAudio() {
  console.log('🔊 Recording system audio...');
  
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission required');
    return;
  }
  
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('❌ No screens available');
    return;
  }
  
  const recorder = new CapRecorder();
  
  try {
    // Record with minimal video (low fps) to focus on audio
    await recorder.startRecording({
      outputPath: './recordings/audio-example',
      screenId: screens[0].id,
      captureSystemAudio: true,
      fps: 1 // Very low fps to minimize video file size
    });
    
    console.log('🎬 Recording audio for 10 seconds...');
    console.log('(Play some music or make some noise!)');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const outputPath = await recorder.stopRecording();
    console.log(`✅ Audio recording saved to: ${outputPath}`);
    console.log('Check the segments folder for the .ogg audio file');
    
  } catch (error) {
    console.error('❌ Audio recording failed:', error.message);
    
    try {
      await recorder.cancelRecording();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Example 4: Pause and resume
async function recordWithPauseResume() {
  console.log('⏸️ Recording with pause/resume...');
  
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission required');
    return;
  }
  
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('❌ No screens available');
    return;
  }
  
  const recorder = new CapRecorder();
  
  try {
    await recorder.startRecording({
      outputPath: './recordings/pause-resume-example',
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('🎬 Recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏸️ Pausing recording...');
    await recorder.pauseRecording();
    
    console.log('💤 Paused for 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('▶️ Resuming recording...');
    await recorder.resumeRecording();
    
    console.log('🎬 Recording for 3 more seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const outputPath = await recorder.stopRecording();
    console.log(`✅ Pause/resume recording saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Pause/resume recording failed:', error.message);
    
    try {
      await recorder.cancelRecording();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Main function to run examples
async function runExamples() {
  console.log('🎥 Cap Recording - Examples');
  console.log('============================\n');
  
  try {
    await recordScreen();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    await recordWindow();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    await recordAudio();
    console.log('\n' + '-'.repeat(40) + '\n');
    
    await recordWithPauseResume();
    
    console.log('\n🎉 All examples completed!');
    console.log('📁 Check the ./recordings/ directory for outputs');
    
  } catch (error) {
    console.error('❌ Examples failed:', error.message);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    runExamples();
  } else {
    const example = args[0].toLowerCase();
    
    switch (example) {
      case 'screen':
        recordScreen();
        break;
      case 'window':
        recordWindow();
        break;
      case 'audio':
        recordAudio();
        break;
      case 'pause':
        recordWithPauseResume();
        break;
      default:
        console.error('❌ Unknown example:', example);
        console.log('Available examples: screen, window, audio, pause');
        console.log('Or run without arguments to run all examples');
    }
  }
}

module.exports = { recordScreen, recordWindow, recordAudio, recordWithPauseResume };