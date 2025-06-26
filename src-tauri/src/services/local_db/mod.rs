pub mod service;
mod table_creator;
pub mod tables {

    pub mod app_kv_store{
        pub mod api;
        mod models{
            pub mod frontend_subscription;
        }
        pub mod entities{
            pub mod kv_pair;
        }
        mod subscription{
            pub mod backend;
            pub mod tauri_subscription_list;
        }
        pub mod tauri_exports;
    }
}
