const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function diagnoseWindowRecording() {
  console.log('🔍 Window Recording Diagnosis');
  console.log('=============================');
  
  // Check basic permissions
  console.log(`✅ Screen capture permission: ${hasScreenCapturePermission()}`);
  
  // List windows with more detail
  const windows = listAvailableWindows();
  console.log(`📋 Available windows: ${windows.length}`);
  
  // Show all windows for debugging
  console.log('\nAll available windows:');
  windows.forEach((window, index) => {
    console.log(`  ${index + 1}. ID: ${window.id}`);
    console.log(`     Title: "${window.title}"`);
    console.log(`     Owner: ${window.ownerName}`);
    console.log(`     ---`);
  });
  
  // Try recording multiple windows to see if it's window-specific
  const testWindows = windows.slice(0, 3); // Test first 3 windows
  
  for (let i = 0; i < testWindows.length; i++) {
    const window = testWindows[i];
    console.log(`\n🎯 Testing window ${i + 1}: "${window.title}" by ${window.ownerName}`);
    
    const recorder = new CapRecorder();
    const outputDir = `./recordings/diagnosis-window-${i + 1}-${Date.now()}`;
    
    try {
      console.log('🎬 Starting recording...');
      
      // Try with minimal options first
      await recorder.startRecording({
        outputPath: outputDir,
        windowId: window.id,
        captureSystemAudio: false,
        fps: 15  // Lower FPS to see if that helps
      });
      
      console.log('⏱️  Recording for 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('⏹️  Attempting to stop...');
      
      // Try to stop with a timeout approach
      const stopPromise = recorder.stopRecording();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stop timeout')), 10000)
      );
      
      try {
        const result = await Promise.race([stopPromise, timeoutPromise]);
        console.log(`✅ Successfully stopped: ${result}`);
        
        // Check if video was created
        const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
        if (fs.existsSync(videoPath)) {
          const stats = fs.statSync(videoPath);
          console.log(`📊 Video size: ${stats.size} bytes`);
          
          if (stats.size > 0) {
            console.log(`🎉 SUCCESS! Window "${window.title}" recorded properly`);
            return; // Found a working window, exit
          } else {
            console.log(`❌ Video file created but empty for "${window.title}"`);
          }
        } else {
          console.log(`❌ No video file created for "${window.title}"`);
        }
        
      } catch (stopError) {
        console.log(`⚠️  Stop failed for "${window.title}": ${stopError.message}`);
        
        // Try to cancel the recording
        try {
          await recorder.cancelRecording();
          console.log('🧹 Recording cancelled');
        } catch (cancelError) {
          console.log(`❌ Cancel also failed: ${cancelError.message}`);
        }
      }
      
    } catch (startError) {
      console.log(`❌ Start failed for "${window.title}": ${startError.message}`);
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📋 Diagnosis Summary:');
  console.log('If all window recordings failed but screen recording works:');
  console.log('• Window recording may require additional macOS permissions');
  console.log('• The target windows might not be capturable');
  console.log('• There could be an issue with the window recording implementation');
  console.log('• Some windows might be protected from screen capture');
}

// Check macOS version and permissions
console.log('🖥️  System Information:');
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Node version: ${process.version}`);

diagnoseWindowRecording().catch(console.error);
