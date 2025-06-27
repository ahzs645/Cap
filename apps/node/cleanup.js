#!/usr/bin/env node

/**
 * Cleanup script to remove old recordings and test outputs
 */

const fs = require('fs');
const path = require('path');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
  }
}

function cleanupRecordings() {
  console.log('🧹 Cleaning up test recordings...');
  
  const recordingsDir = './recordings';
  
  if (!fs.existsSync(recordingsDir)) {
    console.log('📁 No recordings directory found');
    return;
  }
  
  const entries = fs.readdirSync(recordingsDir);
  
  if (entries.length === 0) {
    console.log('📁 Recordings directory is already empty');
    return;
  }
  
  // Remove all recordings
  entries.forEach(entry => {
    const fullPath = path.join(recordingsDir, entry);
    removeDir(fullPath);
  });
  
  console.log(`🎉 Cleaned ${entries.length} recording(s)`);
}

// Run cleanup
if (require.main === module) {
  cleanupRecordings();
}

module.exports = { cleanupRecordings };
