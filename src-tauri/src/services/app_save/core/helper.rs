use std::{
    fs::{self},
    path::{Path, PathBuf},
};

pub fn create_file(app_path: &Path, path: &str) -> PathBuf {
    let new_path = app_path.join(path);

    if !new_path.exists() {
        if let Some(parent) = Path::new(&new_path).parent() {
            fs::create_dir_all(parent).expect("failed to create directories");
        }
        fs::File::create(&new_path).expect("failed to create path");
    }
    new_path
}
