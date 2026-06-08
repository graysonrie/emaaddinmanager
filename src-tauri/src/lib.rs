use services::addin_updater::tauri_exports::*;
use services::addins_registry::tauri_exports::*;
use services::admin::addin_exporter::tauri_exports::*;
use services::admin::addin_packages::tauri_exports::*;
use services::admin::addin_permissions::tauri_exports::*;
use services::admin::tauri_exports::*;
use services::dev_resources::tauri_exports::*;
use services::local_addins::tauri_exports::*;
use services::local_db::tables::app_kv_store::tauri_exports::*;
use services::login_info::tauri_exports::*;
use services::user_startup::tauri_exports::*;
use services::user_stats::metadata::tauri_exports::*;
use services::user_stats::tauri_exports::*;
use tauri::Manager;
use tauri_plugin_autostart::ManagerExt;

mod app_service_container;
mod app_updater;
mod constants;
mod models;
mod services;
mod utils;
mod window_settings;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .args(["--autostart"])
                .app_name("EmaAddinLauncher")
                .build(),
        )
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
            check_for_updates_manual,
            is_revit_running,
            get_pending_updates_info,
            // Addin Permissions
            register_user,
            get_user,
            set_allowed_addin_paths,
            set_blocked_addin_paths,
            block_addin_path_for_all_users,
            unblock_addin_path_for_all_users,
            // Admin
            is_user_admin,
            is_user_super_admin,
            is_other_user_admin,
            is_other_user_super_admin,
            unregister_user,
            // Admin - Addin packages
            create_package_for_registry_addin,
            get_all_addin_packages,
            get_package_info_for_registry_addin,
            check_file_exists,
            load_image_data_for_package,
            open_help_file_for_package,
            regenerate_zip_files_in_registry,
            // Dev resources:
            get_dev_visual_studio_templates,
            install_dev_visual_studio_templates,
            get_all_dev_code_snippets,
            add_dev_code_snippet,
            create_dev_code_snippet_group,
            remove_dev_code_snippet,
            remove_dev_code_snippet_group,
            edit_dev_code_snippet,
            // User startup
            ensure_connected_to_server,
            // Metadata:
            update_user_app_version_metadata,
            get_user_metadata,
            get_user_metadata_many,
            // Login Info
            login_check_if_password_is_set_for_self,
            login_check_if_password_is_set_for_user,
            login_set_password,
            login_verify_password_for_user,
            login_set_temp_password_for_user,
            get_user_stats_summary,
            get_user_stats,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let autostart = app.autolaunch();
            // Enable autostart
            let _ = autostart.enable();
            // Check enable state
            println!(
                "registered for autostart? {}",
                autostart.is_enabled().unwrap_or_else(|err| {
                    println!("Warning: error enabling autostart: {err}");
                    false
                })
            );
            utils::autostart::minimize_if_autostart(app.handle());

            // Prefer checking for updates on startup in the frontend
            // let handle = app.handle().clone();
            // tauri::async_runtime::spawn(async move {
            //     app_updater::update(handle).await.unwrap();
            // });
            // ! Initialize the app service container regardless of if debug mode:
            app_service_container::initialize_app(app.handle());

            let window = app.get_webview_window("main").unwrap();

            window_settings::set_up_window_vibrancy(&window);
            window_settings::register_system_mica_listener(&window);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
