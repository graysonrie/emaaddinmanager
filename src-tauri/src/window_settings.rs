use tauri::{AppHandle, Manager, WebviewWindow};

/// panics if something goes wrong
pub fn set_up_window_vibrancy(window: &WebviewWindow) {
    #[cfg(target_os = "macos")]
    window_vibrancy::apply_vibrancy(window, NSVisualEffectMaterial::HudWindow, None, None)
        .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

    // Neutral tint until the frontend syncs from next-themes (see WindowThemeSync).
    #[cfg(target_os = "windows")]
    window_vibrancy::apply_mica(window, None)
        .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
}

#[tauri::command]
pub fn apply_window_dark(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("could not find window".to_string())?;

    #[cfg(target_os = "windows")]
    window_vibrancy::apply_mica(window, Some(true)).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn apply_window_light(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("could not find window".to_string())?;

    #[cfg(target_os = "windows")]
    window_vibrancy::apply_mica(window, Some(false)).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn apply_window_system(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("could not find window".to_string())?;

    #[cfg(target_os = "windows")]
    window_vibrancy::apply_mica(window, None).map_err(|e| e.to_string())?;

    Ok(())
}
