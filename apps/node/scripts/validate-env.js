#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

console.log(`🔍 Validating build environment for ${platform}-${arch}...`);

function checkCommand(command) {
    try {
        execSync(`which ${command}`, { stdio: 'pipe' });
        return true;
    } catch {
        try {
            execSync(`where ${command}`, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }
}

function checkPath(path) {
    return fs.existsSync(path);
}

function validateMacOS() {
    console.log('🍎 Validating macOS environment...');
    
    const issues = [];
    
    // Check Homebrew
    if (!checkCommand('brew')) {
        issues.push('❌ Homebrew not found. Install with: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }
    
    // Check FFmpeg
    if (!checkCommand('ffmpeg')) {
        issues.push('❌ FFmpeg not found. Install with: brew install ffmpeg');
    }
    
    // Check pkg-config
    if (!checkCommand('pkg-config')) {
        issues.push('❌ pkg-config not found. Install with: brew install pkg-config');
    }
    
    // Check libclang
    const llvmPaths = [
        '/opt/homebrew/opt/llvm/lib/libclang.dylib',  // Apple Silicon
        '/usr/local/opt/llvm/lib/libclang.dylib',     // Intel
    ];
    
    const hasLibclang = llvmPaths.some(path => checkPath(path));
    if (!hasLibclang) {
        issues.push('❌ libclang not found. Install with: brew install llvm');
        issues.push('   Then set: export LIBCLANG_PATH="$(brew --prefix llvm)/lib"');
    }
    
    if (issues.length === 0) {
        console.log('✅ macOS environment is ready for building');
        return true;
    } else {
        console.log('❌ macOS environment issues:');
        issues.forEach(issue => console.log(`  ${issue}`));
        return false;
    }
}

function validateWindows() {
    console.log('🪟 Validating Windows environment...');
    
    const issues = [];
    
    // Check vcpkg
    const vcpkgPath = process.env.VCPKG_ROOT || 'C:\\vcpkg';
    if (!checkPath(vcpkgPath)) {
        issues.push('❌ vcpkg not found. Install with:');
        issues.push('   git clone https://github.com/Microsoft/vcpkg.git C:\\vcpkg');
        issues.push('   C:\\vcpkg\\bootstrap-vcpkg.bat');
    }
    
    // Check FFmpeg
    const ffmpegPath = `${vcpkgPath}\\installed\\x64-windows-static\\lib\\avcodec.lib`;
    if (!checkPath(ffmpegPath)) {
        issues.push('❌ FFmpeg not found in vcpkg. Install with:');
        issues.push('   C:\\vcpkg\\vcpkg.exe install ffmpeg:x64-windows-static');
    }
    
    // Check Visual Studio Build Tools
    if (!checkCommand('cl')) {
        issues.push('❌ Visual Studio Build Tools not found. Install Visual Studio with C++ support');
    }
    
    if (issues.length === 0) {
        console.log('✅ Windows environment is ready for building');
        return true;
    } else {
        console.log('❌ Windows environment issues:');
        issues.forEach(issue => console.log(`  ${issue}`));
        return false;
    }
}

function validateLinux() {
    console.log('🐧 Validating Linux environment...');
    
    const issues = [];
    
    // Check essential tools
    const tools = ['gcc', 'pkg-config', 'make'];
    tools.forEach(tool => {
        if (!checkCommand(tool)) {
            issues.push(`❌ ${tool} not found. Install build-essential package`);
        }
    });
    
    // Check libclang
    const clangPaths = [
        '/usr/lib/llvm-14/lib/libclang.so',
        '/usr/lib/llvm-13/lib/libclang.so',
        '/usr/lib/llvm-12/lib/libclang.so',
        '/usr/lib/x86_64-linux-gnu/libclang.so',
    ];
    
    const hasLibclang = clangPaths.some(path => checkPath(path));
    if (!hasLibclang) {
        issues.push('❌ libclang not found. Install with: sudo apt-get install libclang-dev');
    }
    
    // Check FFmpeg libraries
    const ffmpegLibs = [
        '/usr/lib/x86_64-linux-gnu/libavcodec.so',
        '/usr/local/lib/libavcodec.so'
    ];
    
    const hasFFmpeg = ffmpegLibs.some(lib => checkPath(lib)) || checkCommand('ffmpeg');
    if (!hasFFmpeg) {
        issues.push('❌ FFmpeg development libraries not found.');
        issues.push('   Install with: sudo apt-get install ffmpeg libavcodec-dev libavformat-dev libavutil-dev');
    }
    
    if (issues.length === 0) {
        console.log('✅ Linux environment is ready for building');
        return true;
    } else {
        console.log('❌ Linux environment issues:');
        issues.forEach(issue => console.log(`  ${issue}`));
        return false;
    }
}

function main() {
    let success = false;
    
    switch (platform) {
        case 'darwin':
            success = validateMacOS();
            break;
        case 'linux':
            success = validateLinux();
            break;
        case 'win32':
            success = validateWindows();
            break;
        default:
            console.log(`⚠️  Platform ${platform} validation not implemented`);
            success = true; // Don't fail for unknown platforms
    }
    
    if (success) {
        console.log('🎉 Environment validation passed!');
        process.exit(0);
    } else {
        console.log('❌ Environment validation failed. Please fix the issues above.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { validateMacOS, validateLinux, validateWindows };
