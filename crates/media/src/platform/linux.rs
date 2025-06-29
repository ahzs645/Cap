use std::collections::HashMap;
use crate::platform::{Bounds, CursorShape, LogicalBounds, LogicalPosition, LogicalSize, Window};

// Stub implementations for Linux (no platform-specific support yet)

pub fn get_on_screen_windows() -> Vec<Window> {
    // Return empty list - no window enumeration on Linux yet
    vec![]
}

pub fn bring_window_to_focus(_window_id: u32) {
    // Empty stub for Linux
}

pub fn monitor_bounds(_id: u32) -> Bounds {
    // Return default bounds
    Bounds {
        x: 0.0,
        y: 0.0,
        width: 1920.0,
        height: 1080.0,
    }
}

pub fn primary_monitor_bounds() -> Bounds {
    // Return default bounds
    Bounds {
        x: 0.0,
        y: 0.0,
        width: 1920.0,
        height: 1080.0,
    }
}

pub fn logical_monitor_bounds(_monitor_id: u32) -> Option<LogicalBounds> {
    // Return default logical bounds
    Some(LogicalBounds {
        position: LogicalPosition { x: 0.0, y: 0.0 },
        size: LogicalSize {
            width: 1920.0,
            height: 1080.0,
        },
    })
}

pub fn display_names() -> HashMap<u32, String> {
    // Return empty map - no display enumeration on Linux yet
    HashMap::new()
}

pub fn get_display_refresh_rate(_monitor_id: u32) -> Result<u32, String> {
    // Return default refresh rate
    Ok(60)
}

pub fn display_for_window(_window_id: u32) -> Option<u32> {
    // Return default display
    Some(0)
}

pub fn get_cursor_shape() -> CursorShape {
    // Return unknown cursor shape
    CursorShape::Unknown
}
