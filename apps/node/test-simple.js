const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function testScreenAndWindowCapture() {
  console.log('🎬 Cap Node.js - Screen and Window Capture Test');
  console.log('=' * 50);
  
  // Check permissions
  console.log('\n1. Checking permissions...');
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission not granted!');
    console.error('Please grant permission in System Preferences > Security & Privacy > Privacy > Screen Recording');
    return;
  }
  console.log('✅ Screen capture permissions granted');
  
  // List available screens
  console.log('\n2. Listing available screens...');
  const screens = listAvailableScreens();
  console.log(`✅ Found ${screens.length} screen(s):`);
  screens.forEach((screen, index) => {
    console.log(`   ${index + 1}. ${screen.name} (${screen.refreshRate}Hz) - ID: ${screen.id}`);
  });
  
  // List available windows
  console.log('\n3. Listing available windows...');
  const windows = listAvailableWindows();
  console.log(`✅ Found ${windows.length} window(s):`);
  windows.slice(0, 5).forEach((window, index) => {
    console.log(`   ${index + 1}. "${window.title}" by ${window.ownerName} - ID: ${window.id}`);
  });
  
  if (screens.length === 0) {
    console.error('❌ No screens available for testing');
    return;
  }
  
  // Test screen recording
  console.log('\n4. Testing screen recording...');
  await testScreenRecording(screens[0]);
  
  // Test window recording if windows are available
  if (windows.length > 0) {
    console.log('\n5. Testing window recording...');
    await testWindowRecording(windows[0]);
  } else {
    console.log('\n5. Skipping window recording (no windows available)');
  }
  
  // Test pause/resume
  console.log('\n6. Testing pause/resume functionality...');
  await testPauseResume(screens[0]);
  
  console.log('\n🎉 All tests completed successfully!');
  console.log('Check the ./recordings/ directory for output files');
}

async function testScreenRecording(screen) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/test-screen-final';
  
  try {
    console.log(`   Starting screen recording of "${screen.name}"...`);
    await recorder.startRecording({
      outputPath,
      screenId: screen.id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('   Recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('   Stopping recording...');
    const finalOutputPath = await recorder.stopRecording();
    console.log(`   ✅ Screen recording saved to: ${finalOutputPath}`);
    
    // Check if recording was created
    if (fs.existsSync(finalOutputPath)) {
      console.log('   ✅ Recording file exists');
      
      // Check for content directory structure
      const contentDir = path.join(finalOutputPath, 'content');
      if (fs.existsSync(contentDir)) {
        console.log('   ✅ Content directory created');
        
        const segmentsDir = path.join(contentDir, 'segments');
        if (fs.existsSync(segmentsDir)) {
          console.log('   ✅ Segments directory created');
          
          const segments = fs.readdirSync(segmentsDir);
          if (segments.length > 0) {
            console.log(`   ✅ ${segments.length} segment(s) created`);
            
            // Check first segment
            const firstSegmentPath = path.join(segmentsDir, segments[0]);
            const segmentFiles = fs.readdirSync(firstSegmentPath);
            console.log(`   ✅ Segment contains: ${segmentFiles.join(', ')}`);
          }
        }
      }
    } else {
      console.log('   ⚠️ Recording file not found at expected location');
    }
    
  } catch (error) {
    console.error(`   ❌ Screen recording failed: ${error.message}`);
    try {
      await recorder.cancelRecording();
    } catch (cancelError) {
      console.error(`   ❌ Failed to cancel recording: ${cancelError.message}`);
    }
    throw error;
  }
}

async function testWindowRecording(window) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/test-window-final';
  
  try {
    console.log(`   Starting window recording of "${window.title}" by ${window.ownerName}...`);
    await recorder.startRecording({
      outputPath,
      windowId: window.id,
      captureSystemAudio: false, // Usually don't need audio for window recording
      fps: 30
    });
    
    console.log('   Recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('   Stopping recording...');
    const finalOutputPath = await recorder.stopRecording();
    console.log(`   ✅ Window recording saved to: ${finalOutputPath}`);
    
    // Check if recording was created
    if (fs.existsSync(finalOutputPath)) {
      console.log('   ✅ Window recording file exists');
      
      // Check for content directory structure
      const contentDir = path.join(finalOutputPath, 'content');
      if (fs.existsSync(contentDir)) {
        console.log('   ✅ Content directory created');
        
        const segmentsDir = path.join(contentDir, 'segments');
        if (fs.existsSync(segmentsDir)) {
          console.log('   ✅ Segments directory created');
          
          const segments = fs.readdirSync(segmentsDir);
          if (segments.length > 0) {
            console.log(`   ✅ ${segments.length} segment(s) created`);
          }
        }
      }
    } else {
      console.log('   ⚠️ Window recording file not found at expected location');
    }
    
  } catch (error) {
    console.error(`   ❌ Window recording failed: ${error.message}`);
    try {
      await recorder.cancelRecording();
    } catch (cancelError) {
      console.error(`   ❌ Failed to cancel recording: ${cancelError.message}`);
    }
    throw error;
  }
}

async function testPauseResume(screen) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/test-pause-resume-final';
  
  try {
    console.log('   Starting pause/resume test...');
    await recorder.startRecording({
      outputPath,
      screenId: screen.id,
      captureSystemAudio: false,
      fps: 24
    });
    
    console.log('   Recording for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Pausing recording...');
    await recorder.pauseRecording();
    
    console.log('   Paused for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Resuming recording...');
    await recorder.resumeRecording();
    
    console.log('   Recording for 1 more second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Stopping recording...');
    const finalOutputPath = await recorder.stopRecording();
    console.log(`   ✅ Pause/resume recording saved to: ${finalOutputPath}`);
    
    if (fs.existsSync(finalOutputPath)) {
      console.log('   ✅ Pause/resume recording file exists');
    }
    
  } catch (error) {
    console.error(`   ❌ Pause/resume test failed: ${error.message}`);
    try {
      await recorder.cancelRecording();
    } catch (cancelError) {
      console.error(`   ❌ Failed to cancel recording: ${cancelError.message}`);
    }
    throw error;
  }
}

// Run the test
testScreenAndWindowCapture().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
