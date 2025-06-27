use cap_media::sources::{list_screens, list_windows, ScreenCaptureTarget};
use cap_recording::{spawn_studio_recording_actor, RecordingBaseInputs, StudioRecordingHandle};
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

#[napi]
pub struct CapRecorder {
    handle: Arc<Mutex<Option<StudioRecordingHandle>>>,
}

#[napi(object)]
pub struct RecordingConfig {
    pub output_path: String,
    pub screen_id: Option<u32>,
    pub window_id: Option<u32>,
    pub capture_system_audio: Option<bool>,
    pub fps: Option<u32>,
}

#[napi]
impl CapRecorder {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            handle: Arc::new(Mutex::new(None)),
        }
    }

    #[napi]
    pub async fn start_recording(&self, config: RecordingConfig) -> Result<()> {
        let capture_target = if let Some(screen_id) = config.screen_id {
            ScreenCaptureTarget::Screen { id: screen_id }
        } else if let Some(window_id) = config.window_id {
            ScreenCaptureTarget::Window { id: window_id }
        } else {
            return Err(Error::new(
                Status::InvalidArg,
                "Must specify screen_id or window_id",
            ));
        };

        let recording_id = uuid::Uuid::new_v4().to_string();
        let output_path = PathBuf::from(config.output_path);

        let base_inputs = RecordingBaseInputs {
            capture_target,
            capture_system_audio: config.capture_system_audio.unwrap_or(false),
            mic_feed: &None, // Could be extended to support mic
        };

        let (handle, _done_rx) = spawn_studio_recording_actor(
            recording_id,
            output_path,
            base_inputs,
            None,  // Camera feed - could be added
            false, // Custom cursor capture
        )
        .await
        .map_err(|e| {
            Error::new(
                Status::GenericFailure,
                format!("Failed to start recording: {}", e),
            )
        })?;

        {
            let mut handle_guard = self.handle.lock().await;
            *handle_guard = Some(handle);
        }

        Ok(())
    }

    #[napi]
    pub async fn stop_recording(&self) -> Result<String> {
        let mut handle_guard = self.handle.lock().await;
        if let Some(handle) = handle_guard.take() {
            // Add a timeout to prevent hanging
            let stop_future = handle.stop();
            let timeout_duration = std::time::Duration::from_secs(30);

            match tokio::time::timeout(timeout_duration, stop_future).await {
                Ok(Ok(completed)) => Ok(completed.project_path.to_string_lossy().to_string()),
                Ok(Err(e)) => Err(Error::new(
                    Status::GenericFailure,
                    format!("Failed to stop recording: {}", e),
                )),
                Err(_) => Err(Error::new(
                    Status::GenericFailure,
                    "Stop recording timed out after 30 seconds",
                )),
            }
        } else {
            Err(Error::new(Status::InvalidArg, "No active recording"))
        }
    }

    #[napi]
    pub async fn pause_recording(&self) -> Result<()> {
        let handle_guard = self.handle.lock().await;
        if let Some(handle) = handle_guard.as_ref() {
            handle.pause().await.map_err(|e| {
                Error::new(Status::GenericFailure, format!("Failed to pause: {}", e))
            })?;
        }
        Ok(())
    }

    #[napi]
    pub async fn resume_recording(&self) -> Result<()> {
        let handle_guard = self.handle.lock().await;
        if let Some(handle) = handle_guard.as_ref() {
            handle.resume().await.map_err(|e| {
                Error::new(Status::GenericFailure, format!("Failed to resume: {}", e))
            })?;
        }
        Ok(())
    }

    #[napi]
    pub async fn cancel_recording(&self) -> Result<()> {
        let mut handle_guard = self.handle.lock().await;
        if let Some(handle) = handle_guard.take() {
            handle.cancel().await.map_err(|e| {
                Error::new(Status::GenericFailure, format!("Failed to cancel: {}", e))
            })?;
        }
        Ok(())
    }
}

// Utility functions for listing available capture targets
#[napi]
pub fn list_available_screens() -> Vec<ScreenInfo> {
    list_screens()
        .into_iter()
        .map(|(screen, _)| ScreenInfo {
            id: screen.id,
            name: screen.name,
            refresh_rate: screen.refresh_rate,
        })
        .collect()
}

#[napi]
pub fn list_available_windows() -> Vec<WindowInfo> {
    list_windows()
        .into_iter()
        .map(|(window, _)| WindowInfo {
            id: window.id,
            title: window.name,
            owner_name: window.owner_name,
        })
        .collect()
}

#[napi(object)]
pub struct ScreenInfo {
    pub id: u32,
    pub name: String,
    pub refresh_rate: u32,
}

#[napi(object)]
pub struct WindowInfo {
    pub id: u32,
    pub title: String,
    pub owner_name: String,
}

// Utility function to check if screen capture permissions are available
#[napi]
pub fn has_screen_capture_permission() -> bool {
    scap::has_permission()
}
