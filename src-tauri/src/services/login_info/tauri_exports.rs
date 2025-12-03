use std::sync::Arc;

use crate::services::login_info::service::LoginInfoService;
use tauri::State;



#[tauri::command]
pub async fn login_check_if_password_is_set_for_self(login_info:State<'_, Arc<LoginInfoService>>)->Result<bool, String>{
    login_info.is_password_set_for_self().await
}

#[tauri::command]
pub async fn login_check_if_password_is_set_for_user(user_email:String,login_info:State<'_, Arc<LoginInfoService>>)->Result<bool, String>{
    login_info.is_password_set_for_user(user_email).await
}

#[tauri::command]
pub async fn login_set_password(password:String,login_info:State<'_, Arc<LoginInfoService>>)->Result<(), String>{
    login_info.set_password(password).await
}

#[tauri::command]
pub async fn login_verify_password_for_user(user_email:String,password:String,login_info:State<'_, Arc<LoginInfoService>>)->Result<bool, String>{
    login_info.verify_password_for_user(user_email, password).await
}

#[tauri::command]
pub async fn login_set_temp_password_for_user(user_email:String,login_info:State<'_, Arc<LoginInfoService>>)->Result<(), String>{
    login_info.set_temp_password_for_user(user_email).await
}