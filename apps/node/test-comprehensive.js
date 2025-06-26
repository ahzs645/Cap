const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('./index');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = [];
    this.recordingsDir = './recordings';
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
      this.testResults.push({ name: testName, status: 'PASSED', duration });
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ FAILED: ${testName} (${duration}ms)`);
      console.error(`   Error: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', duration, error: error.message });
      return false;
    }
  }

  async testPermissions() {
    const hasPermission = hasScreenCapturePermission();
    if (!hasPermission) {
      throw new Error('Screen capture permission not granted. Please grant permission in System Preferences > Security & Privacy > Privacy > Screen Recording');
    }
    console.log('✓ Screen capture permissions granted');
  }

  async testListScreens() {
    const screens = listAvailableScreens();
    if (screens.length === 0) {
      throw new Error('No screens available');
    }
    
    console.log(`✓ Found ${screens.length} screen(s):`);
    screens.forEach((screen, index) => {
      console.log(`   ${index + 1}. ${screen.name} (${screen.refreshRate}Hz) - ID: ${screen.id}`);
    });
    
    // Validate screen structure
    screens.forEach(screen => {
      if (typeof screen.id !== 'number' || typeof screen.name !== 'string' || typeof screen.refreshRate !== 'number') {
        throw new Error(`Invalid screen structure: ${JSON.stringify(screen)}`);
      }
    });
    
    return screens;
  }

  async testListWindows() {
    const windows = listAvailableWindows();
    if (windows.length === 0) {
      throw new Error('No windows available');
    }
    
    console.log(`✓ Found ${windows.length} window(s):`);
    windows.slice(0, 5).forEach((window, index) => {
      console.log(`   ${index + 1}. "${window.title}" by ${window.ownerName} - ID: ${window.id}`);
    });
    
    // Validate window structure
    windows.forEach(window => {
      if (typeof window.id !== 'number' || typeof window.title !== 'string' || typeof window.ownerName !== 'string') {
        throw new Error(`Invalid window structure: ${JSON.stringify(window)}`);
      }
    });
    
    return windows;
  }

  async testScreenRecording(screens) {
    if (screens.length === 0) {
      throw new Error('No screens available for recording');
    }

    const recorder = new CapRecorder();
    const outputPath = path.join(this.recordingsDir, 'test-screen-recording');
    
    try {
      console.log(`✓ Starting screen recording of "${screens[0].name}"`);
      await recorder.startRecording({
        outputPath,
        screenId: screens[0].id,
        captureSystemAudio: true,
        fps: 30
      });
      
      console.log('✓ Recording started, capturing for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✓ Stopping recording...');
      const finalOutputPath = await recorder.stopRecording();
      console.log(`✓ Screen recording saved to: ${finalOutputPath}`);
      
      // Verify the output file exists
      if (!fs.existsSync(finalOutputPath)) {
        throw new Error(`Output file not found at: ${finalOutputPath}`);
      }
      
      const stats = fs.statSync(finalOutputPath);
      console.log(`✓ Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      if (stats.size === 0) {
        throw new Error('Output file is empty');
      }
      
    } catch (error) {
      try {
        await recorder.cancelRecording();
      } catch (cancelError) {
        console.error(`Failed to cancel recording: ${cancelError.message}`);
      }
      throw error;
    }
  }

  async testWindowRecording(windows) {
    if (windows.length === 0) {
      throw new Error('No windows available for recording');
    }

    // Find a good window to record (prefer system apps or browsers)
    const targetWindow = windows.find(w => 
      w.ownerName.toLowerCase().includes('finder') ||
      w.ownerName.toLowerCase().includes('chrome') ||
      w.ownerName.toLowerCase().includes('safari') ||
      w.ownerName.toLowerCase().includes('code') ||
      w.ownerName.toLowerCase().includes('terminal') ||
      w.ownerName.toLowerCase().includes('system')
    ) || windows[0];

    const recorder = new CapRecorder();
    const outputPath = path.join(this.recordingsDir, 'test-window-recording');
    
    try {
      console.log(`✓ Starting window recording of "${targetWindow.title}" by ${targetWindow.ownerName}`);
      await recorder.startRecording({
        outputPath,
        windowId: targetWindow.id,
        captureSystemAudio: false,
        fps: 30
      });
      
      console.log('✓ Recording started, capturing for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✓ Stopping recording...');
      const finalOutputPath = await recorder.stopRecording();
      console.log(`✓ Window recording saved to: ${finalOutputPath}`);
      
      // Verify the output file exists
      if (!fs.existsSync(finalOutputPath)) {
        throw new Error(`Output file not found at: ${finalOutputPath}`);
      }
      
      const stats = fs.statSync(finalOutputPath);
      console.log(`✓ Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      if (stats.size === 0) {
        throw new Error('Output file is empty');
      }
      
    } catch (error) {
      try {
        await recorder.cancelRecording();
      } catch (cancelError) {
        console.error(`Failed to cancel recording: ${cancelError.message}`);
      }
      throw error;
    }
  }

  async testPauseResume(screens) {
    if (screens.length === 0) {
      throw new Error('No screens available for recording');
    }

    const recorder = new CapRecorder();
    const outputPath = path.join(this.recordingsDir, 'test-pause-resume');
    
    try {
      console.log('✓ Starting pause/resume test recording');
      await recorder.startRecording({
        outputPath,
        screenId: screens[0].id,
        captureSystemAudio: false,
        fps: 24
      });
      
      console.log('✓ Recording for 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✓ Pausing recording...');
      await recorder.pauseRecording();
      
      console.log('✓ Paused for 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✓ Resuming recording...');
      await recorder.resumeRecording();
      
      console.log('✓ Recording for 1 more second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalOutputPath = await recorder.stopRecording();
      console.log(`✓ Pause/resume recording saved to: ${finalOutputPath}`);
      
      // Verify the output file exists
      if (!fs.existsSync(finalOutputPath)) {
        throw new Error(`Output file not found at: ${finalOutputPath}`);
      }
      
    } catch (error) {
      try {
        await recorder.cancelRecording();
      } catch (cancelError) {
        console.error(`Failed to cancel recording: ${cancelError.message}`);
      }
      throw error;
    }
  }

  async testCancelRecording(screens) {
    if (screens.length === 0) {
      throw new Error('No screens available for recording');
    }

    const recorder = new CapRecorder();
    const outputPath = path.join(this.recordingsDir, 'test-cancel-recording');
    
    try {
      console.log('✓ Starting recording to test cancellation');
      await recorder.startRecording({
        outputPath,
        screenId: screens[0].id,
        captureSystemAudio: false,
        fps: 30
      });
      
      console.log('✓ Recording for 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✓ Cancelling recording...');
      await recorder.cancelRecording();
      console.log('✓ Recording cancelled successfully');
      
      // Verify no output file was created (or it was cleaned up)
      const possibleOutputs = [
        outputPath + '.mp4',
        outputPath + '.mov',
        outputPath + '.webm'
      ];
      
      let foundOutput = false;
      for (const possibleOutput of possibleOutputs) {
        if (fs.existsSync(possibleOutput)) {
          foundOutput = true;
          break;
        }
      }
      
      if (foundOutput) {
        console.log('⚠️  Warning: Output file exists after cancellation (this might be expected behavior)');
      } else {
        console.log('✓ No output file created after cancellation');
      }
      
    } catch (error) {
      throw error;
    }
  }

  async testErrorHandling() {
    const recorder = new CapRecorder();
    
    // Test invalid screen ID
    try {
      await recorder.startRecording({
        outputPath: './recordings/invalid-test',
        screenId: 99999,
        fps: 30
      });
      throw new Error('Expected error for invalid screen ID but recording started');
    } catch (error) {
      if (error.message.includes('Expected error')) {
        throw error;
      }
      console.log('✓ Correctly rejected invalid screen ID');
    }
    
    // Test invalid window ID
    try {
      await recorder.startRecording({
        outputPath: './recordings/invalid-test',
        windowId: 99999,
        fps: 30
      });
      throw new Error('Expected error for invalid window ID but recording started');
    } catch (error) {
      if (error.message.includes('Expected error')) {
        throw error;
      }
      console.log('✓ Correctly rejected invalid window ID');
    }
    
    // Test missing output path
    try {
      await recorder.startRecording({
        screenId: 1,
        fps: 30
      });
      throw new Error('Expected error for missing output path but recording started');
    } catch (error) {
      if (error.message.includes('Expected error')) {
        throw error;
      }
      console.log('✓ Correctly rejected missing output path');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  ❌ ${r.name}: ${r.error}`));
    }
    
    console.log('\nTest Details:');
    this.testResults.forEach(r => {
      const icon = r.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${icon} ${r.name} (${r.duration}ms)`);
    });
    
    console.log('='.repeat(60));
  }
}

async function main() {
  const testRunner = new TestRunner();
  
  console.log('🚀 Cap Node.js Package - Comprehensive Test Suite');
  console.log('Testing both screen and window capture functionality');
  console.log('='.repeat(60));
  
  let screens = [];
  let windows = [];
  
  // Run all tests
  await testRunner.runTest('Permissions Check', () => testRunner.testPermissions());
  
  if (await testRunner.runTest('List Available Screens', async () => {
    screens = await testRunner.testListScreens();
  })) {
    // Only run screen-dependent tests if we have screens
    await testRunner.runTest('Screen Recording', () => testRunner.testScreenRecording(screens));
    await testRunner.runTest('Pause/Resume Recording', () => testRunner.testPauseResume(screens));
    await testRunner.runTest('Cancel Recording', () => testRunner.testCancelRecording(screens));
  }
  
  if (await testRunner.runTest('List Available Windows', async () => {
    windows = await testRunner.testListWindows();
  })) {
    // Only run window-dependent tests if we have windows
    await testRunner.runTest('Window Recording', () => testRunner.testWindowRecording(windows));
  }
  
  await testRunner.runTest('Error Handling', () => testRunner.testErrorHandling());
  
  testRunner.printSummary();
  
  // Exit with appropriate code
  const failedCount = testRunner.testResults.filter(r => r.status === 'FAILED').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Test suite failed with error:', error);
  process.exit(1);
});
