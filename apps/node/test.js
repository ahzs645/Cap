const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');

async function main() {
  console.log('Cap Recording Node.js Example');
  
  // Check if we have permission
  if (!hasScreenCapturePermission()) {
    console.error('Screen capture permission not granted. Please grant permission and try again.');
    return;
  }
  
  // List available screens
  const screens = listAvailableScreens();
  console.log('Available screens:', screens);
  
  // List available windows
  const windows = listAvailableWindows();
  console.log('Available windows:', windows.slice(0, 5)); // Show first 5 windows
  
  if (screens.length === 0) {
    console.error('No screens available for recording');
    return;
  }
  
  const recorder = new CapRecorder();
  
  try {
    console.log('Starting recording...');
    await recorder.startRecording({
      outputPath: './recordings/test-recording',
      screenId: screens[0].id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('Recording started! Recording for 5 seconds...');
    
    // Record for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Stopping recording...');
    const outputPath = await recorder.stopRecording();
    console.log('Recording saved to:', outputPath);
    
  } catch (error) {
    console.error('Recording failed:', error);
    try {
      await recorder.cancelRecording();
    } catch (cancelError) {
      console.error('Failed to cancel recording:', cancelError);
    }
  }
}

main().catch(console.error);
