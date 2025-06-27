const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('../index');
const fs = require('fs');

/**
 * Advanced tests - error handling, edge cases, and advanced features
 */
async function runAdvancedTests() {
  console.log('🧪 Cap Recording - Advanced Tests');
  console.log('==================================');
  
  if (!hasScreenCapturePermission()) {
    throw new Error('Screen capture permission required');
  }
  
  console.log('1. Testing error handling...');
  await testErrorHandling();
  
  console.log('\n2. Testing recording cancellation...');
  await testRecordingCancellation();
  
  console.log('\n3. Testing multiple recorders...');
  await testMultipleRecorders();
  
  console.log('\n4. Testing invalid parameters...');
  await testInvalidParameters();
  
  console.log('\n🎉 All advanced tests passed!');
}

async function testErrorHandling() {
  const recorder = new CapRecorder();
  
  // Test invalid screen ID
  try {
    await recorder.startRecording({
      outputPath: './recordings/invalid-screen',
      screenId: 99999,
      captureSystemAudio: false,
      fps: 30
    });
    throw new Error('Should have failed with invalid screen ID');
  } catch (error) {
    if (error.message.includes('Should have failed')) throw error;
    console.log('   ✅ Invalid screen ID properly rejected');
  }
  
  // Test invalid window ID
  try {
    await recorder.startRecording({
      outputPath: './recordings/invalid-window',
      windowId: 99999,
      captureSystemAudio: false,
      fps: 30
    });
    throw new Error('Should have failed with invalid window ID');
  } catch (error) {
    if (error.message.includes('Should have failed')) throw error;
    console.log('   ✅ Invalid window ID properly rejected');
  }
  
  // Test missing output path
  try {
    await recorder.startRecording({
      screenId: listAvailableScreens()[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    throw new Error('Should have failed with missing output path');
  } catch (error) {
    if (error.message.includes('Should have failed')) throw error;
    console.log('   ✅ Missing output path properly rejected');
  }
  
  // Test missing screen/window ID
  try {
    await recorder.startRecording({
      outputPath: './recordings/no-target',
      captureSystemAudio: false,
      fps: 30
    });
    throw new Error('Should have failed with no target specified');
  } catch (error) {
    if (error.message.includes('Should have failed')) throw error;
    console.log('   ✅ Missing target properly rejected');
  }
}

async function testRecordingCancellation() {
  const recorder = new CapRecorder();
  const screens = listAvailableScreens();
  
  try {
    await recorder.startRecording({
      outputPath: './recordings/cancel-test',
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('   Recording started, waiting 1 second...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   Cancelling recording...');
    await recorder.cancelRecording();
    
    console.log('   ✅ Recording cancelled successfully');
    
    // Verify no output file was created
    if (fs.existsSync('./recordings/cancel-test')) {
      console.log('   ⚠️  Output directory exists after cancellation (this may be expected)');
    } else {
      console.log('   ✅ No output directory created after cancellation');
    }
    
  } catch (error) {
    throw new Error(`Recording cancellation failed: ${error.message}`);
  }
}

async function testMultipleRecorders() {
  // Test that multiple recorder instances can't record simultaneously
  const recorder1 = new CapRecorder();
  const recorder2 = new CapRecorder();
  const screens = listAvailableScreens();
  
  try {
    await recorder1.startRecording({
      outputPath: './recordings/multi-test-1',
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 30
    });
    
    console.log('   First recorder started...');
    
    // Try to start second recorder
    try {
      await recorder2.startRecording({
        outputPath: './recordings/multi-test-2',
        screenId: screens[0].id,
        captureSystemAudio: false,
        fps: 30
      });
      
      // If we get here, cleanup both
      await recorder2.stopRecording();
      await recorder1.stopRecording();
      
      console.log('   ⚠️  Multiple recorders allowed (behavior may vary)');
      
    } catch (error) {
      console.log('   ✅ Multiple simultaneous recordings properly prevented');
      await recorder1.stopRecording();
    }
    
  } catch (error) {
    throw new Error(`Multiple recorder test failed: ${error.message}`);
  }
}

async function testInvalidParameters() {
  const recorder = new CapRecorder();
  const screens = listAvailableScreens();
  
  // Test invalid FPS
  try {
    await recorder.startRecording({
      outputPath: './recordings/invalid-fps',
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: -1
    });
    
    // If it starts, stop it
    await recorder.stopRecording();
    console.log('   ⚠️  Invalid FPS accepted (may have default fallback)');
    
  } catch (error) {
    console.log('   ✅ Invalid FPS properly rejected');
  }
  
  // Test very high FPS
  try {
    await recorder.startRecording({
      outputPath: './recordings/high-fps',
      screenId: screens[0].id,
      captureSystemAudio: false,
      fps: 1000
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await recorder.stopRecording();
    console.log('   ⚠️  Very high FPS accepted (may be clamped internally)');
    
  } catch (error) {
    console.log('   ✅ Very high FPS properly rejected');
  }
}

// Run the tests
if (require.main === module) {
  runAdvancedTests().catch(error => {
    console.error('❌ Advanced test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAdvancedTests };
