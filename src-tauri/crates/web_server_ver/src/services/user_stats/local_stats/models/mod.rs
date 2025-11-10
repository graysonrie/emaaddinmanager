use crate::services::user_stats::InstalledAddinModel;


#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshUserStatsModel {
   pub disciplines:Vec<String>,
   pub installed_addins:Vec<InstalledAddinModel>
}