const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');

async function recordWindowExample() {
  console.log('=== Window Recording Example ===');
  
  // Check permissions
  if (!hasScreenCapturePermission()) {
    console.error('Screen capture permission not granted. Please grant permission and try again.');
    return;
  }
  
  // List available windows
  const windows = listAvailableWindows();
  console.log('Available windows:', windows.slice(0, 3)); // Show first 3
  
  if (windows.length === 0) {
    console.error('No windows available for recording');
    return;
  }
  
  // Find a window to record (prefer a browser or text editor)
  const targetWindow = windows.find(w => 
    w.ownerName.toLowerCase().includes('chrome') ||
    w.ownerName.toLowerCase().includes('safari') ||
    w.ownerName.toLowerCase().includes('code') ||
    w.ownerName.toLowerCase().includes('terminal')
  ) || windows[0];
  
  console.log(`Recording window: "${targetWindow.title}" by ${targetWindow.ownerName}`);
  
  const recorder = new CapRecorder();
  
  try {
    await recorder.startRecording({
      outputPath: './recordings/window-recording',
      windowId: targetWindow.id,
      captureSystemAudio: false, // Usually don't need audio for window recording
      fps: 30
    });
    
    console.log('Recording started! Recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const outputPath = await recorder.stopRecording();
    console.log('Window recording saved to:', outputPath);
    
  } catch (error) {
    console.error('Window recording failed:', error);
    try {
      await recorder.cancelRecording();
    } catch (cancelError) {
      console.error('Failed to cancel recording:', cancelError);
    }
  }
}

async function pauseResumeExample() {
  console.log('\n=== Pause/Resume Recording Example ===');
  
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('No screens available');
    return;
  }
  
  const recorder = new CapRecorder();
  
  try {
    await recorder.startRecording({
      outputPath: './recordings/pause-resume-test',
      screenId: screens[0].id,
      captureSystemAudio: true,
      fps: 24
    });
    
    console.log('Recording started...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Pausing recording...');
    await recorder.pauseRecording();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Resuming recording...');
    await recorder.resumeRecording();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const outputPath = await recorder.stopRecording();
    console.log('Pause/resume recording saved to:', outputPath);
    
  } catch (error) {
    console.error('Pause/resume recording failed:', error);
  }
}

async function multipleScreensExample() {
  console.log('\n=== Multiple Screens Example ===');
  
  const screens = listAvailableScreens();
  console.log('All available screens:');
  screens.forEach((screen, index) => {
    console.log(`  ${index + 1}. ${screen.name} (${screen.refreshRate}Hz) - ID: ${screen.id}`);
  });
  
  if (screens.length > 1) {
    console.log(`Recording secondary screen: ${screens[1].name}`);
    
    const recorder = new CapRecorder();
    
    try {
      await recorder.startRecording({
        outputPath: './recordings/secondary-screen',
        screenId: screens[1].id,
        captureSystemAudio: false,
        fps: 60 // Match screen refresh rate if possible
      });
      
      console.log('Recording secondary screen for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const outputPath = await recorder.stopRecording();
      console.log('Secondary screen recording saved to:', outputPath);
      
    } catch (error) {
      console.error('Secondary screen recording failed:', error);
    }
  } else {
    console.log('Only one screen available, skipping multiple screens example');
  }
}

async function main() {
  try {
    await recordWindowExample();
    await pauseResumeExample();
    await multipleScreensExample();
    
    console.log('\n=== All examples completed! ===');
    console.log('Check the ./recordings/ directory for output files');
    
  } catch (error) {
    console.error('Example failed:', error);
  }
}

main().catch(console.error);
