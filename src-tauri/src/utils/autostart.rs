use tauri::Manager;

pub fn minimize_if_autostart(app: &tauri::AppHandle) {
    let is_autostart = std::env::args().any(|a| a == "--autostart");
    if is_autostart {
        if let Some(win) = app.get_webview_window("main") {
            let _ = win.minimize(); // ignore error if not supported on a platform
        }
    }
}
