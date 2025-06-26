const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function testWindowRecording() {
  console.log('=== Testing Window Recording ===');
  
  if (!hasScreenCapturePermission()) {
    console.error('Screen capture permission not granted');
    return;
  }
  
  const windows = listAvailableWindows();
  console.log('Available windows:', windows.length);
  
  if (windows.length === 0) {
    console.error('No windows available');
    return;
  }
  
  // Get a window that's likely to be visible
  const targetWindow = windows.find(w => 
    w.ownerName.toLowerCase().includes('code') ||
    w.ownerName.toLowerCase().includes('terminal') ||
    w.ownerName.toLowerCase().includes('finder')
  ) || windows[0];
  
  console.log(`Target window: "${targetWindow.title}" by ${targetWindow.ownerName} (ID: ${targetWindow.id})`);
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/window-test';
  
  try {
    await recorder.startRecording({
      outputPath: outputDir,
      windowId: targetWindow.id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('Window recording started, recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const outputPath = await recorder.stopRecording();
    console.log('Recording saved to:', outputPath);
    
    // Check if the video file was actually created and has content
    const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`Video file size: ${stats.size} bytes`);
      if (stats.size === 0) {
        console.error('❌ Window recording FAILED - video file is empty');
      } else {
        console.log('✅ Window recording SUCCESS - video file created');
      }
    } else {
      console.error('❌ Window recording FAILED - no video file created');
    }
    
  } catch (error) {
    console.error('Window recording error:', error);
  }
}

async function testSystemAudio() {
  console.log('\n=== Testing System Audio Recording ===');
  
  const screens = listAvailableScreens();
  if (screens.length === 0) {
    console.error('No screens available');
    return;
  }
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/audio-test';
  
  try {
    await recorder.startRecording({
      outputPath: outputDir,
      screenId: screens[0].id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('Audio recording started, recording for 3 seconds...');
    console.log('(Play some audio on your system during this time)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const outputPath = await recorder.stopRecording();
    console.log('Recording saved to:', outputPath);
    
    // Check if the audio file was actually created and has content
    const audioPath = path.join(outputDir, 'content/segments/segment-0/system_audio.ogg');
    if (fs.existsSync(audioPath)) {
      const stats = fs.statSync(audioPath);
      console.log(`Audio file size: ${stats.size} bytes`);
      if (stats.size < 1000) { // Very small file might be empty/silent
        console.warn('⚠️  System audio recording - file is very small, might be silent');
      } else {
        console.log('✅ System audio recording SUCCESS - audio file created');
      }
    } else {
      console.error('❌ System audio recording FAILED - no audio file created');
    }
    
  } catch (error) {
    console.error('System audio recording error:', error);
  }
}

async function main() {
  console.log('=== Cap Node.js Package Test ===\n');
  
  await testWindowRecording();
  await testSystemAudio();
  
  console.log('\n=== Test Complete ===');
}

main().catch(console.error);
