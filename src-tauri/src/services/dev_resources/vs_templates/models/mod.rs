use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VsTemplateInfoModel {
    pub vs_template_info_version: String,
    pub templates: Vec<VsTemplateModel>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VsTemplateModel {
    pub version: String,
    pub relative_path: String,
    pub display_name: String,
    pub description: String,
    pub relative_path_to_image: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
 pub struct FrontendVsTemplateModel {
    pub version: String,
    pub display_name: String,
    pub description: String,
    pub image_data: Vec<u8>,
    pub is_installed: bool,
}
