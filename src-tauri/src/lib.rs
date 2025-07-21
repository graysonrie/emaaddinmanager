use services::addin_updater::tauri_exports::*;
use services::addins_registry::tauri_exports::*;
use services::admin::addin_exporter::tauri_exports::*;
use services::admin::addin_permissions::tauri_exports::*;
use services::local_addins::tauri_exports::*;
use services::local_db::tables::app_kv_store::tauri_exports::*;
use services::user_stats::tauri_exports::*;
use tauri::Manager;

mod app_service_container;
mod app_updater;
mod constants;
mod models;
mod services;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // Local DB
            kv_store_set,
            kv_store_get,
            kv_store_subscribe_to_key,
            // Addins Registry
            get_addins,
            install_addins,
            get_categories,
            delist_addin,
            add_category_to_registry,
            // Local Addins
            get_local_addins,
            get_revit_versions,
            uninstall_addins,
            // Addin Exporter
            export_addin,
            get_addin_file_info,
            get_all_project_dlls,
            build_addin,
            // User Stats
            create_user_stats,
            does_user_exist,
            change_user_stats_email,
            change_user_stats_name,
            update_user_stats,
            get_all_user_stats,
            // Addin Updater
            check_for_updates,
            // Addin Permissions
            register_user,
            get_user,
            add_allowed_addin_paths,
            remove_allowed_addin_paths,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            // Prefer checking for updates on startup in the frontend
            // let handle = app.handle().clone();
            // tauri::async_runtime::spawn(async move {
            //     app_updater::update(handle).await.unwrap();
            // });
            // ! Initialize the app service container regardless of if debug mode:
            app_service_container::initialize_app(app.handle());

            // let window = app.get_webview_window("main").unwrap();
            // #[cfg(target_os = "macos")]
            // window_vibrancy::apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            //     .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            // #[cfg(target_os = "windows")]
            // window_vibrancy::apply_acrylic(&window, Some((18, 18, 18, 125)))
            //     .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
