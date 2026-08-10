use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ReplacementYearModel {
    pub year: String,
    pub files: Vec<String>,
}
