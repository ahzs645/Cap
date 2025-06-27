const { CapRecorder, listAvailableScreens, listAvailableWindows, hasScreenCapturePermission } = require('../index');
const fs = require('fs');
const path = require('path');

/**
 * Audio-focused tests - validates audio capture functionality
 */
async function runAudioTests() {
  console.log('🔊 Cap Recording - Audio Tests');
  console.log('===============================');
  console.log('Note: Play some music/audio during these tests for better validation\n');
  
  if (!hasScreenCapturePermission()) {
    throw new Error('Screen capture permission required');
  }
  
  const screens = listAvailableScreens();
  const windows = listAvailableWindows();
  
  if (screens.length === 0) throw new Error('No screens available');
  if (windows.length === 0) throw new Error('No windows available');
  
  // Test system audio only
  console.log('1. Testing system audio recording...');
  await testSystemAudioOnly();
  
  // Test screen with audio
  console.log('\n2. Testing screen recording with audio...');
  await testScreenWithAudio(screens[0]);
  
  // Test window with audio
  console.log('\n3. Testing window recording with audio...');
  const targetWindow = windows.find(w => 
    w.ownerName.toLowerCase().includes('music') ||
    w.ownerName.toLowerCase().includes('spotify') ||
    w.ownerName.toLowerCase().includes('chrome')
  ) || windows[0];
  
  await testWindowWithAudio(targetWindow);
  
  console.log('\n🎉 All audio tests completed!');
  console.log('📁 Check recordings for audio files (.ogg)');
}

async function testSystemAudioOnly() {
  const recorder = new CapRecorder();
  const outputPath = './recordings/audio-only-test';
  
  try {
    // Record system audio without video (using screen but very low fps)
    await recorder.startRecording({
      outputPath,
      screenId: listAvailableScreens()[0].id,
      captureSystemAudio: true,
      fps: 1 // Minimal video to focus on audio
    });
    
    console.log('   Recording audio for 5 seconds... (play some music!)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const finalPath = await recorder.stopRecording();
    
    // Check audio file
    const audioFile = findAudioFile(finalPath);
    if (!audioFile) {
      throw new Error('No audio file created');
    }
    
    const audioStats = fs.statSync(audioFile);
    console.log(`   ✅ Audio recorded: ${(audioStats.size / 1024).toFixed(1)} KB`);
    
    if (audioStats.size < 1000) {
      console.log('   ⚠️  Small audio file - ensure audio was playing during test');
    }
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Audio recording failed: ${error.message}`);
  }
}

async function testScreenWithAudio(screen) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/screen-audio-test';
  
  try {
    await recorder.startRecording({
      outputPath,
      screenId: screen.id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log('   Recording screen + audio for 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalPath = await recorder.stopRecording();
    
    const videoFile = findVideoFile(finalPath);
    const audioFile = findAudioFile(finalPath);
    
    if (!videoFile) throw new Error('No video file created');
    if (!audioFile) throw new Error('No audio file created');
    
    const videoStats = fs.statSync(videoFile);
    const audioStats = fs.statSync(audioFile);
    
    console.log(`   ✅ Video: ${(videoStats.size / 1024).toFixed(1)} KB`);
    console.log(`   ✅ Audio: ${(audioStats.size / 1024).toFixed(1)} KB`);
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Screen + audio recording failed: ${error.message}`);
  }
}

async function testWindowWithAudio(window) {
  const recorder = new CapRecorder();
  const outputPath = './recordings/window-audio-test';
  
  try {
    await recorder.startRecording({
      outputPath,
      windowId: window.id,
      captureSystemAudio: true,
      fps: 30
    });
    
    console.log(`   Recording window + audio for 3 seconds...`);
    console.log(`   Target: "${window.title}" by ${window.ownerName}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalPath = await recorder.stopRecording();
    
    const videoFile = findVideoFile(finalPath);
    const audioFile = findAudioFile(finalPath);
    
    if (!videoFile) throw new Error('No video file created');
    if (!audioFile) throw new Error('No audio file created');
    
    const videoStats = fs.statSync(videoFile);
    const audioStats = fs.statSync(audioFile);
    
    console.log(`   ✅ Video: ${(videoStats.size / 1024).toFixed(1)} KB`);
    console.log(`   ✅ Audio: ${(audioStats.size / 1024).toFixed(1)} KB`);
    
  } catch (error) {
    try { await recorder.cancelRecording(); } catch (e) {}
    throw new Error(`Window + audio recording failed: ${error.message}`);
  }
}

function findVideoFile(outputPath) {
  const segmentsDir = path.join(outputPath, 'content', 'segments');
  if (!fs.existsSync(segmentsDir)) return null;
  
  const segments = fs.readdirSync(segmentsDir);
  if (segments.length === 0) return null;
  
  const segmentPath = path.join(segmentsDir, segments[0]);
  const files = fs.readdirSync(segmentPath);
  const videoFile = files.find(f => f.endsWith('.mp4'));
  
  return videoFile ? path.join(segmentPath, videoFile) : null;
}

function findAudioFile(outputPath) {
  const segmentsDir = path.join(outputPath, 'content', 'segments');
  if (!fs.existsSync(segmentsDir)) return null;
  
  const segments = fs.readdirSync(segmentsDir);
  if (segments.length === 0) return null;
  
  const segmentPath = path.join(segmentsDir, segments[0]);
  const files = fs.readdirSync(segmentPath);
  const audioFile = files.find(f => f.endsWith('.ogg'));
  
  return audioFile ? path.join(segmentPath, audioFile) : null;
}

// Run the tests
if (require.main === module) {
  runAudioTests().catch(error => {
    console.error('❌ Audio test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAudioTests };
