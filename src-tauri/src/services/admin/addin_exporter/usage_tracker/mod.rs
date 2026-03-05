use chrono::{DateTime, Local, Utc};
use std::path::Path;

use crate::services::admin::addin_exporter::models::simplified_addin_info_model::SimplifiedAddinInfoModel;

const USAGE_TRACKER_FILE_PATH: &str =
    "S:\\BasesRevitAddinRepositories\\repos\\publish_tracker.xlsx";

const HEADERS: &[&str] = &[
    "Time of Release",
    "Addin Name",
    "Addin Version",
    "Reason for Export",
];

pub struct UsageDataPoint {
    pub time_of_release: DateTime<Utc>,
    pub addin_name: String,
    pub addin_version: String,
    pub reason_for_export: Option<String>,
    pub publisher_name: String,
}

impl From<SimplifiedAddinInfoModel> for UsageDataPoint {
    fn from(simplified_addin_info: SimplifiedAddinInfoModel) -> Self {
        UsageDataPoint {
            time_of_release: Utc::now(),
            addin_name: simplified_addin_info.name,
            addin_version: simplified_addin_info.addin_version,
            reason_for_export: simplified_addin_info.reason_for_export,
            publisher_name: simplified_addin_info.email,
        }
    }
}

pub fn add_usage_data_point(usage_data_point: UsageDataPoint) -> Result<(), String> {
    let path = Path::new(USAGE_TRACKER_FILE_PATH);

    let mut book = if path.exists() {
        umya_spreadsheet::reader::xlsx::read(path)
            .map_err(|e| format!("Failed to read existing spreadsheet: {e}"))?
    } else {
        let mut new_book = umya_spreadsheet::new_file();
        let sheet = new_book
            .get_sheet_mut(&0)
            .ok_or_else(|| format!("Failed to get default sheet"))?;

        for (col_idx, header) in HEADERS.iter().enumerate() {
            sheet
                .get_cell_mut((col_idx as u32 + 1, 1))
                .set_value(*header);
        }

        new_book
    };

    let sheet = book
        .get_sheet_mut(&0)
        .ok_or_else(|| format!("Failed to get sheet"))?;

    let next_row = sheet.get_highest_row() + 1;
    let reason_for_export = usage_data_point.reason_for_export.unwrap_or_default();
    let publisher_name = usage_data_point.publisher_name;

    let local_time: DateTime<Local> = usage_data_point.time_of_release.into();
    sheet
        .get_cell_mut((1, next_row))
        .set_value(local_time.format("%Y-%m-%d %I:%M %p").to_string());
    sheet
        .get_cell_mut((2, next_row))
        .set_value(usage_data_point.addin_name);
    sheet
        .get_cell_mut((3, next_row))
        .set_value(usage_data_point.addin_version);
    sheet
        .get_cell_mut((4, next_row))
        .set_value(format!("{} - {}", publisher_name, reason_for_export));

    umya_spreadsheet::writer::xlsx::write(&book, path)
        .map_err(|e| format!("Failed to write spreadsheet: {e}"))?;

    Ok(())
}
