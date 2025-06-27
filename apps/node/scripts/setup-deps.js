#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

console.log(`🔧 Setting up dependencies for ${platform}-${arch}...`);

function runCommand(command, options = {}) {
    try {
        console.log(`Running: ${command}`);
        execSync(command, { stdio: 'inherit', ...options });
        return true;
    } catch (error) {
        console.error(`Failed to run: ${command}`);
        console.error(error.message);
        return false;
    }
}

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

function setupMacOS() {
    console.log('🍎 Setting up macOS dependencies...');
    
    // Check if Homebrew is installed
    if (!checkCommand('brew')) {
        console.log('Installing Homebrew...');
        runCommand('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    }
    
    // Install required packages
    const packages = ['ffmpeg', 'pkg-config', 'llvm'];
    console.log(`Installing packages: ${packages.join(', ')}`);
    
    if (!runCommand(`brew install ${packages.join(' ')}`)) {
        console.warn('Some packages may already be installed or failed to install');
    }
    
    // Set environment variables
    const brewPrefix = execSync('brew --prefix', { encoding: 'utf8' }).trim();
    const llvmPath = `${brewPrefix}/opt/llvm/lib`;
    
    if (fs.existsSync(llvmPath)) {
        process.env.LIBCLANG_PATH = llvmPath;
        console.log(`Set LIBCLANG_PATH=${llvmPath}`);
    }
    
    process.env.PKG_CONFIG_PATH = `${brewPrefix}/lib/pkgconfig:${brewPrefix}/opt/ffmpeg/lib/pkgconfig`;
    console.log('✅ macOS dependencies setup complete');
}

function setupLinux() {
    console.log('🐧 Setting up Linux dependencies...');
    
    // Detect package manager
    let packageManager = '';
    if (checkCommand('apt-get')) {
        packageManager = 'apt';
    } else if (checkCommand('yum')) {
        packageManager = 'yum';
    } else if (checkCommand('dnf')) {
        packageManager = 'dnf';
    } else if (checkCommand('pacman')) {
        packageManager = 'pacman';
    }
    
    if (!packageManager) {
        console.error('❌ No supported package manager found');
        process.exit(1);
    }
    
    console.log(`Using package manager: ${packageManager}`);
    
    const packages = {
        apt: [
            'pkg-config', 'libpipewire-0.3-dev', 'libasound2-dev',
            'libpulse-dev', 'libjack-jackd2-dev', 'libssl-dev',
            'libv4l-dev', 'libclang-dev', 'ffmpeg', 'libavcodec-dev',
            'libavformat-dev', 'libavutil-dev', 'libswscale-dev',
            'libswresample-dev', 'build-essential'
        ],
        yum: [
            'pkgconfig', 'pipewire-devel', 'alsa-lib-devel',
            'pulseaudio-libs-devel', 'jack-audio-connection-kit-devel',
            'openssl-devel', 'libv4l-devel', 'clang-devel',
            'ffmpeg-devel', 'gcc'
        ],
        dnf: [
            'pkgconf-devel', 'pipewire-devel', 'alsa-lib-devel',
            'pulseaudio-libs-devel', 'jack-audio-connection-kit-devel',
            'openssl-devel', 'libv4l-devel', 'clang-devel',
            'ffmpeg-devel', 'gcc'
        ]
    };
    
    const installPackages = packages[packageManager] || packages.apt;
    
    if (packageManager === 'apt') {
        runCommand('sudo apt-get update');
        runCommand(`sudo apt-get install -y ${installPackages.join(' ')}`);
    } else if (packageManager === 'yum') {
        runCommand(`sudo yum install -y ${installPackages.join(' ')}`);
    } else if (packageManager === 'dnf') {
        runCommand(`sudo dnf install -y ${installPackages.join(' ')}`);
    }
    
    // Set LIBCLANG_PATH
    const clangPaths = [
        '/usr/lib/llvm-14/lib',
        '/usr/lib/llvm-13/lib',
        '/usr/lib/llvm-12/lib',
        '/usr/lib/x86_64-linux-gnu'
    ];
    
    for (const clangPath of clangPaths) {
        if (fs.existsSync(clangPath)) {
            process.env.LIBCLANG_PATH = clangPath;
            console.log(`Set LIBCLANG_PATH=${clangPath}`);
            break;
        }
    }
    
    console.log('✅ Linux dependencies setup complete');
}

function setupWindows() {
    console.log('🪟 Setting up Windows dependencies...');
    
    // Check if vcpkg is available
    const vcpkgRoot = process.env.VCPKG_ROOT || 'C:\\vcpkg';
    
    if (!fs.existsSync(vcpkgRoot)) {
        console.log('Installing vcpkg...');
        runCommand('git clone https://github.com/Microsoft/vcpkg.git C:\\vcpkg');
        runCommand('C:\\vcpkg\\bootstrap-vcpkg.bat');
        runCommand('C:\\vcpkg\\vcpkg.exe integrate install');
    }
    
    // Install FFmpeg
    if (!fs.existsSync(`${vcpkgRoot}\\installed\\x64-windows-static\\lib\\avcodec.lib`)) {
        console.log('Installing FFmpeg via vcpkg...');
        runCommand(`${vcpkgRoot}\\vcpkg.exe install ffmpeg:x64-windows-static`);
    }
    
    // Set environment variables
    process.env.VCPKG_ROOT = vcpkgRoot;
    process.env.FFMPEG_DIR = `${vcpkgRoot}\\installed\\x64-windows-static`;
    process.env.PKG_CONFIG_PATH = `${vcpkgRoot}\\installed\\x64-windows-static\\lib\\pkgconfig`;
    
    console.log('✅ Windows dependencies setup complete');
}

function main() {
    switch (platform) {
        case 'darwin':
            setupMacOS();
            break;
        case 'linux':
            setupLinux();
            break;
        case 'win32':
            setupWindows();
            break;
        default:
            console.log(`⚠️  Platform ${platform} not specifically supported, trying generic setup...`);
    }
    
    console.log('🎉 Dependency setup completed!');
}

if (require.main === module) {
    main();
}

module.exports = { setupMacOS, setupLinux, setupWindows };
