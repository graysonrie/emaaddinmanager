pub mod service;
pub mod tauri_exports;

pub struct PasswordHashResult {
    password_hash: String,
    salt: String,
}
