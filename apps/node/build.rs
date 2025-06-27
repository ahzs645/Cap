use std::env;

fn main() {
    // Setup NAPI build
    napi_build::setup();
    
    // Platform-specific configurations
    let target = env::var("TARGET").unwrap_or_default();
    
    if target.contains("apple") {
        setup_macos();
    } else if target.contains("windows") {
        setup_windows();
    } else if target.contains("linux") {
        setup_linux();
    }
}

fn setup_macos() {
    // Ensure libclang is found for bindgen
    if env::var("LIBCLANG_PATH").is_err() {
        // Try common Homebrew paths
        let homebrew_paths = [
            "/opt/homebrew/opt/llvm/lib",  // Apple Silicon
            "/usr/local/opt/llvm/lib",     // Intel
        ];
        
        for path in &homebrew_paths {
            if std::path::Path::new(path).exists() {
                println!("cargo:rustc-env=LIBCLANG_PATH={}", path);
                break;
            }
        }
    }
}

fn setup_windows() {
    // Set up for vcpkg if available
    if let Ok(vcpkg_root) = env::var("VCPKG_ROOT") {
        println!("cargo:rustc-link-search=native={}/installed/x64-windows-static/lib", vcpkg_root);
        println!("cargo:rustc-env=PKG_CONFIG_PATH={}/installed/x64-windows-static/lib/pkgconfig", vcpkg_root);
    }
    
    // Enable static linking for Windows
    println!("cargo:rustc-link-lib=static=avcodec");
    println!("cargo:rustc-link-lib=static=avformat");
    println!("cargo:rustc-link-lib=static=avutil");
    println!("cargo:rustc-link-lib=static=swscale");
    println!("cargo:rustc-link-lib=static=swresample");
}

fn setup_linux() {
    // Ensure libclang is found
    if env::var("LIBCLANG_PATH").is_err() {
        let llvm_paths = [
            "/usr/lib/llvm-14/lib",
            "/usr/lib/llvm-13/lib",
            "/usr/lib/llvm-12/lib",
            "/usr/lib/x86_64-linux-gnu",
        ];
        
        for path in &llvm_paths {
            if std::path::Path::new(path).exists() {
                println!("cargo:rustc-env=LIBCLANG_PATH={}", path);
                break;
            }
        }
    }
}
