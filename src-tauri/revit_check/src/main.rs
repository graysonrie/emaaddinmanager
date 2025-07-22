use crate::{helpers::CloseRevitResult, models::RevitProcessModel};

mod helpers;
mod models;

fn main() -> Result<(), String> {
    // Close Revit and store info
    let (close_result, processes_to_reopen) = helpers::close_revit_windows_with_reopen_info()?;
    println!("Closed: {}", close_result.message);

    // Wait a moment to ensure processes are fully closed
    std::thread::sleep(std::time::Duration::from_secs(2));

    // Reopen Revit
    let reopen_result = helpers::reopen_revit_windows(&processes_to_reopen)?;
    println!("Reopened: {}", reopen_result.message);

    Ok(())
}
