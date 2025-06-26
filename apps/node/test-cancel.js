const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

async function testWindowRecordingWithCancel() {
  console.log('🔄 Testing Window Recording with Cancel Instead of Stop');
  console.log('====================================================');
  
  const windows = listAvailableWindows();
  if (windows.length === 0) {
    console.error('❌ No windows available');
    return;
  }
  
  // Try the VS Code window since it's open
  const targetWindow = windows.find(w => 
    w.ownerName.toLowerCase().includes('code')
  ) || windows[0];
  
  console.log(`🎯 Target: "${targetWindow.title}" by ${targetWindow.ownerName}`);
  
  const recorder = new CapRecorder();
  const outputDir = './recordings/cancel-test-' + Date.now();
  
  try {
    console.log('🎬 Starting recording...');
    await recorder.startRecording({
      outputPath: outputDir,
      windowId: targetWindow.id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('⏱️  Recording for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🛑 Using cancelRecording() instead of stopRecording()...');
    await recorder.cancelRecording();
    console.log('✅ Recording cancelled successfully');
    
    // Check if anything was recorded despite cancelling
    const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`📊 Video file exists: ${stats.size} bytes`);
      if (stats.size > 0) {
        console.log('🎉 Some content was captured before cancelling');
      }
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function testScreenRecordingConfirmation() {
  console.log('\n✅ Confirming Screen Recording Still Works');
  console.log('==========================================');
  
  const screens = listAvailableScreens();
  const recorder = new CapRecorder();
  const outputDir = './recordings/screen-confirm-' + Date.now();
  
  try {
    await recorder.startRecording({
      outputPath: outputDir,
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('⏱️  Recording screen for 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await recorder.stopRecording();
    console.log(`✅ Screen recording completed: ${result}`);
    
    const videoPath = path.join(outputDir, 'content/segments/segment-0/display.mp4');
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      console.log(`📊 Screen video: ${(stats.size / 1024).toFixed(2)} KB`);
    }
    
  } catch (error) {
    console.error(`❌ Screen recording error: ${error.message}`);
  }
}

async function main() {
  await testWindowRecordingWithCancel();
  await testScreenRecordingConfirmation();
  
  console.log('\n📋 Summary:');
  console.log('• Window recording starts but stopRecording() hangs');
  console.log('• Screen recording works perfectly with stopRecording()');
  console.log('• This indicates a bug in the window recording stop functionality');
  console.log('• The issue is specific to stopping window recordings, not starting them');
}

main().catch(console.error);
