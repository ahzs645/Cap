fn main() {
    napi_build::setup();
    
    // Add Windows-specific system libraries required for FFmpeg with Media Foundation and DirectShow
    #[cfg(target_os = "windows")]
    {
        println!("cargo:warning=Configuring Windows multimedia libraries for FFmpeg");
        
        // Core DirectShow and Media Foundation libraries that FFmpeg requires
        println!("cargo:rustc-link-lib=strmiids");  // DirectShow interface IDs
        println!("cargo:rustc-link-lib=mfuuid");    // Media Foundation UUIDs  
        println!("cargo:rustc-link-lib=mf");        // Media Foundation core
        println!("cargo:rustc-link-lib=mfplat");    // Media Foundation platform
        
        // Additional Windows multimedia and COM libraries
        println!("cargo:rustc-link-lib=ole32");     // COM support
        println!("cargo:rustc-link-lib=oleaut32");  // COM automation
        println!("cargo:rustc-link-lib=winmm");     // Windows multimedia
        println!("cargo:rustc-link-lib=uuid");      // UUID support
        println!("cargo:rustc-link-lib=quartz");    // DirectShow runtime
        
        // Additional potential dependencies for FFmpeg on Windows
        println!("cargo:rustc-link-lib=user32");    // User interface
        println!("cargo:rustc-link-lib=kernel32");  // Kernel functions
        println!("cargo:rustc-link-lib=gdi32");     // Graphics device interface
        
        println!("cargo:warning=Windows multimedia libraries configured for FFmpeg linking");
    }
}