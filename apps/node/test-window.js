const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function testWindowRecording() {
  console.log('🎥 Window Recording Test');
  console.log('========================');
  
  // Check permissions
  if (!hasScreenCapturePermission()) {
    console.error('❌ Screen capture permission not granted');
    return;
  }
  console.log('✅ Screen capture permissions OK');
  
  // List available windows
  const windows = listAvailableWindows();
  console.log(`📋 Found ${windows.length} available windows`);
  
  if (windows.length === 0) {
    console.error('❌ No windows available for recording');
    return;
  }
  
  // Show first few windows for user to see
  console.log('\nAvailable windows:');
  windows.slice(0, 5).forEach((window, index) => {
    console.log(`  ${index + 1}. "${window.title}" by ${window.ownerName} (ID: ${window.id})`);
  });
  
  // Find a suitable window (prefer text editors, browsers, or system apps)
  const targetWindow = windows.find(w => {
    const owner = w.ownerName.toLowerCase();
    const title = w.title.toLowerCase();
    return owner.includes('code') || 
           owner.includes('terminal') || 
           owner.includes('finder') ||
           owner.includes('safari') ||
           owner.includes('chrome') ||
           title.includes('github') ||
           title.includes('cap') ||
           !title.includes('menubar') &&
           !title.includes('menu') &&
           w.title.length > 0;
  }) || windows[0];
  
  console.log(`\n🎯 Selected window: "${targetWindow.title}" by ${targetWindow.ownerName}`);
  console.log(`   Window ID: ${targetWindow.id}`);
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/window-test-' + Date.now();
  
  console.log(`\n🎬 Starting window recording to: ${outputDir}`);
  console.log('Recording will last 5 seconds...');
  
  try {
    // Start recording
    const startTime = Date.now();
    await recorder.startRecording({
      outputPath: outputDir,
      windowId: targetWindow.id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('✅ Recording started successfully');
    
    // Record for 5 seconds
    console.log('⏱️  Recording... (5 seconds)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Stop recording
    console.log('⏹️  Stopping recording...');
    const outputPath = await recorder.stopRecording();
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`✅ Recording completed in ${totalTime}s`);
    console.log(`💾 Output path: ${outputPath}`);
    
    // Validate the recording
    console.log('\n🔍 Validating recording...');
    
    const contentPath = path.join(outputDir, 'content');
    const segmentsPath = path.join(contentPath, 'segments');
    
    if (!fs.existsSync(contentPath)) {
      console.error('❌ Content directory not found');
      return;
    }
    
    if (!fs.existsSync(segmentsPath)) {
      console.error('❌ Segments directory not found');
      return;
    }
    
    const segments = fs.readdirSync(segmentsPath);
    console.log(`📁 Found ${segments.length} segment(s)`);
    
    if (segments.length === 0) {
      console.error('❌ No segments created');
      return;
    }
    
    // Check the first segment
    const firstSegment = path.join(segmentsPath, segments[0]);
    const segmentFiles = fs.readdirSync(firstSegment);
    console.log(`📄 Segment files: ${segmentFiles.join(', ')}`);
    
    // Check for video file
    const videoFile = segmentFiles.find(f => f.endsWith('.mp4'));
    if (!videoFile) {
      console.error('❌ No video file (.mp4) found in segment');
      return;
    }
    
    const videoPath = path.join(firstSegment, videoFile);
    const videoStats = fs.statSync(videoPath);
    const videoSizeKB = (videoStats.size / 1024).toFixed(2);
    
    console.log(`🎥 Video file: ${videoFile}`);
    console.log(`📊 Video size: ${videoSizeKB} KB`);
    
    if (videoStats.size === 0) {
      console.error('❌ Video file is empty');
      return;
    }
    
    if (videoStats.size < 10000) { // Less than 10KB might indicate an issue
      console.warn(`⚠️  Video file is quite small (${videoSizeKB} KB) - might indicate recording issue`);
    }
    
    console.log('\n🎉 Window recording test SUCCESSFUL!');
    console.log('✅ Recording started without errors');
    console.log('✅ Recording stopped without errors');
    console.log('✅ Proper file structure created');
    console.log('✅ Video file created with content');
    
  } catch (error) {
    console.error(`❌ Window recording FAILED: ${error.message}`);
    console.error('Full error:', error);
    
    // Try to cancel recording
    try {
      await recorder.cancelRecording();
      console.log('🧹 Recording cancelled');
    } catch (cancelError) {
      console.error('❌ Failed to cancel recording:', cancelError.message);
    }
  }
}

// Run the test
testWindowRecording().catch(console.error);
