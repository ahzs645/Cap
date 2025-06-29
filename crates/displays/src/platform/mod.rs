#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::DisplayImpl;

#[cfg(windows)]
mod win;
#[cfg(windows)]
pub use win::DisplayImpl;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::DisplayImpl;