const { runBasicTests } = require('./basic');
const { runAudioTests } = require('./audio');
const { runAdvancedTests } = require('./advanced');

/**
 * Run all test suites
 */
async function runAllTests() {
  console.log('🚀 Cap Recording - Complete Test Suite');
  console.log('=======================================\n');
  
  const startTime = Date.now();
  let passed = 0;
  let failed = 0;
  
  const tests = [
    { name: 'Basic Tests', fn: runBasicTests },
    { name: 'Audio Tests', fn: runAudioTests },
    { name: 'Advanced Tests', fn: runAdvancedTests }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Starting: ${test.name}`);
      console.log(`${'='.repeat(50)}`);
      
      await test.fn();
      passed++;
      
    } catch (error) {
      console.error(`\n❌ ${test.name} FAILED:`);
      console.error(`   ${error.message}`);
      failed++;
    }
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Time: ${totalTime}s`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
    console.log('📁 Check the ./recordings/ directory for test outputs');
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    runAllTests();
  } else {
    const suite = args[0].toLowerCase();
    
    switch (suite) {
      case 'basic':
        runBasicTests().catch(error => {
          console.error('❌ Basic tests failed:', error.message);
          process.exit(1);
        });
        break;
        
      case 'audio':
        runAudioTests().catch(error => {
          console.error('❌ Audio tests failed:', error.message);
          process.exit(1);
        });
        break;
        
      case 'advanced':
        runAdvancedTests().catch(error => {
          console.error('❌ Advanced tests failed:', error.message);
          process.exit(1);
        });
        break;
        
      default:
        console.error('❌ Unknown test suite:', suite);
        console.log('Available test suites: basic, audio, advanced');
        console.log('Or run without arguments to run all tests');
        process.exit(1);
    }
  }
}

module.exports = { runAllTests, runBasicTests, runAudioTests, runAdvancedTests };
