const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function testScreenRecording() {
  console.log('🖥️  Screen Recording Test (for comparison)');
  console.log('==========================================');
  
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission not granted');
    return;
  }
  
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('❌ No screens available');
    return;
  }
  
  console.log(`📱 Using screen: ${screens[0].name} (${screens[0].refreshRate}Hz)`);
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/screen-test-' + Date.now();
  
  console.log(`🎬 Starting 3-second screen recording...`);
  
  try {
    await recorder.startRecording({
      outputPath: outputDir,
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('✅ Screen recording started');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('⏹️  Stopping screen recording...');
    const outputPath = await recorder.stopRecording();
    
    console.log(`✅ Screen recording completed: ${outputPath}`);
    
    // Check the file
    const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`📊 Screen video size: ${(stats.size / 1024).toFixed(2)} KB`);
      return stats.size > 0;
    }
    return false;
    
  } catch (error) {
    console.error(`❌ Screen recording failed: ${error.message}`);
    return false;
  }
}

async function testQuickWindowRecording() {
  console.log('\n🎥 Quick Window Recording Test (1 second)');
  console.log('===========================================');
  
  const windows = listAvailableWindows();
  if (windows.length === 0) {
    console.error('❌ No windows available');
    return;
  }
  
  // Try to find VS Code window since it's likely open
  const targetWindow = windows.find(w => 
    w.ownerName.toLowerCase().includes('code') ||
    w.title.toLowerCase().includes('cap')
  ) || windows[0];
  
  console.log(`🎯 Recording window: "${targetWindow.title}" by ${targetWindow.ownerName}`);
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/quick-window-test-' + Date.now();
  
  try {
    await recorder.startRecording({
      outputPath: outputDir,
      windowId: targetWindow.id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('✅ Window recording started, recording for 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('⏹️  Stopping...');
    const outputPath = await recorder.stopRecording();
    
    console.log(`✅ Window recording completed: ${outputPath}`);
    
    // Check the file
    const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`📊 Window video size: ${(stats.size / 1024).toFixed(2)} KB`);
      return stats.size > 0;
    }
    return false;
    
  } catch (error) {
    console.error(`❌ Window recording failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Recording Comparison Test');
  console.log('=============================\n');
  
  const screenSuccess = await testScreenRecording();
  const windowSuccess = await testQuickWindowRecording();
  
  console.log('\n📋 Results Summary:');
  console.log(`Screen recording: ${screenSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Window recording: ${windowSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (screenSuccess && !windowSuccess) {
    console.log('\n🔍 Analysis: Screen recording works but window recording produces empty files.');
    console.log('This could indicate:');
    console.log('• Window recording permissions issue');
    console.log('• Target window not properly captured');
    console.log('• Window recording API configuration issue');
  } else if (!screenSuccess && !windowSuccess) {
    console.log('\n🔍 Analysis: Both recording types failed - may be a general recording issue.');
  } else if (screenSuccess && windowSuccess) {
    console.log('\n🎉 Both recording types work correctly!');
  }
}

main().catch(console.error);
