use std::{fs, path::PathBuf};

use dirs::data_dir;

use crate::{constants, services::app_save::core::helper::create_file};

pub enum AppSavePath {
    AppData,
    Other(PathBuf),
}
pub struct AppSaveService {
    pub save_dir: PathBuf,
}

impl AppSaveService {
    pub fn new(save_dir: AppSavePath) -> Self {
        let save_path = AppSaveService::get_save_path(save_dir);
        if !save_path.exists() {
            fs::create_dir_all(save_path.clone()).expect("could not create App directory");
        }
        Self {
            save_dir: save_path,
        }
    }
    pub fn create_path(&self, path: &str) -> PathBuf {
        create_file(&self.save_dir, path)
    }

    fn get_save_path(save_dir: AppSavePath) -> PathBuf {
        let save_path = match save_dir {
            AppSavePath::AppData => data_dir().expect("Could not find AppData directory"),
            AppSavePath::Other(path) => path,
        };
        save_path.join(constants::APP_NAME)
    }
}
