use services::addins_registry::tauri_exports::*;
use services::local_addins::tauri_exports::*;
use services::local_db::tables::app_kv_store::tauri_exports::*;

mod app_service_container;
mod constants;
mod models;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // Local DB
            kv_store_set,
            kv_store_get,
            kv_store_subscribe_to_key,
            // Addins Registry
            get_addins,
            // Local Addins
            get_local_addins,
            get_revit_versions,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;

                app_service_container::initialize_app(app.handle());
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
