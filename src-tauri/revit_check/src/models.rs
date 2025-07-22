use serde::{Deserialize, Serialize};

use crate::helpers::RevitProcessInfo;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevitProcessModel {
    pub hwnd: u32,
    pub process_id: u32,
    pub window_title: String,
}

impl From<RevitProcessInfo> for RevitProcessModel {
    fn from(process: RevitProcessInfo) -> Self {
        Self {
            hwnd: process.hwnd.0 as u32,
            process_id: process.process_id,
            window_title: process.window_title,
        }
    }
}
