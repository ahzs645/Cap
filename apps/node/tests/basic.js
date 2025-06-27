const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('../index');
const fs = require('fs');
const path = require('path');

/**
 * Basic functionality test - quick validation that all core features work
 */
async function runBasicTests() {
  console.log('🎥 Cap Recording - Basic Tests');
  console.log('==============================');
  
  // Check permissions
  console.log('\n1. Checking permissions...');
  if (!hasScreenCapturePermission()) {
    throw new Error('Screen capture permission not granted. Please grant permission in System Preferences.');
  }
  console.log('✅ Screen capture permissions OK');
  
  // List screens
  console.log('\n2. Listing available screens...');
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    throw new Error('No screens available');
  }
  console.log(`✅ Found ${screens.length} screen(s):`);
  screens.forEach((screen, i) => {
    console.log(`   ${i + 1}. ${screen.name} - ID: ${screen.id}`);
  });
  
  // List windows
  console.log('\n3. Listing available windows...');
  const windows = listAvailableWindows();
  if (windows.length === 0) {
    throw new Error('No windows available');
  }
  console.log(`✅ Found ${windows.length} window(s):`);
  windows.slice(0, 5).forEach((window, i) => {
    console.log(`   ${i + 1}. "${window.title}" by ${window.ownerName} - ID: ${window.id}`);
  });
  if (windows.length > 5) {
    console.log(`   ... and ${windows.length - 5} more`);
  }
  
  // Test screen recording
  console.log('\n4. Testing screen recording (3 seconds)...');
  await testScreenRecording(screens[0]);
  
  // Test window recording
  console.log('\n5. Testing window recording (3 seconds)...');
  const targetWindow = findSuitableWindow(windows);
  await testWindowRecording(targetWindow);
  
  // Test pause/resume
  console.log('\n6. Testing pause/resume functionality...');
  await testPauseResume(screens[0]);
  
  console.log('\n🎉 All basic tests passed!');
  console.log('📁 Check the ./recordings/ directory for output files');
}

async function testScreenRecording(screen) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/basic-screen-test';
  
  try {
    await recorder.startRecording({
      outputPath,
      screenId: screen.id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('   Recording screen...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalPath = await recorder.stopRecording();
    validateRecording(finalPath, 'screen');
    console.log('   ✅ Screen recording successful');
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Screen recording failed: ${error.message}`);
  }
}

async function testWindowRecording(window) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/basic-window-test';
  
  try {
    await recorder.startRecording({
      outputPath,
      windowId: window.id,
      captureSystemAudio: true, // Enable audio capture
      fps: 30
    });
    
    console.log(`   Recording window: "${window.title}"...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalPath = await recorder.stopRecording();
    validateRecording(finalPath, 'window');
    console.log('   ✅ Window recording successful');
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Window recording failed: ${error.message}`);
  }
}

async function testPauseResume(screen) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/basic-pause-resume-test';
  
  try {
    await recorder.startRecording({
      outputPath,
      screenId: screen.id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('   Recording for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Pausing...');
    await recorder.pauseRecording();
    
    console.log('   Paused for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Resuming...');
    await recorder.resumeRecording();
    
    console.log('   Recording for 1 more second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalPath = await recorder.stopRecording();
    validateRecording(finalPath, 'pause-resume');
    console.log('   ✅ Pause/resume successful');
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Pause/resume test failed: ${error.message}`);
  }
}

function findSuitableWindow(windows) {
  // Prefer common applications that are likely to be visible
  const preferred = windows.find(w => {
    const owner = w.ownerName.toLowerCase();
    const title = w.title.toLowerCase();
    return (
      owner.includes('code') || 
      owner.includes('chrome') || 
      owner.includes('safari') ||
      owner.includes('finder') ||
      owner.includes('terminal') ||
      (title.length > 0 && !title.includes('menubar') && !title.includes('menu'))
    );
  });
  
  return preferred || windows[0];
}

function validateRecording(outputPath, type) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Recording directory not found: ${outputPath}`);
  }
  
  const contentDir = path.join(outputPath, 'content');
  const segmentsDir = path.join(contentDir, 'segments');
  
  if (!fs.existsSync(segmentsDir)) {
    throw new Error('Recording segments not found');
  }
  
  const segments = fs.readdirSync(segmentsDir);
  if (segments.length === 0) {
    throw new Error('No recording segments created');
  }
  
  const segmentPath = path.join(segmentsDir, segments[0]);
  const files = fs.readdirSync(segmentPath);
  
  const hasVideo = files.some(f => f.endsWith('.mp4'));
  if (!hasVideo) {
    throw new Error('No video file found in recording');
  }
  
  // Check video file size
  const videoFile = files.find(f => f.endsWith('.mp4'));
  const videoPath = path.join(segmentPath, videoFile);
  const stats = fs.statSync(videoPath);
  
  if (stats.size === 0) {
    throw new Error('Video file is empty');
  }
}

// Run the tests
if (require.main === module) {
  runBasicTests().catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runBasicTests };
