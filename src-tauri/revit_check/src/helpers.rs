use std::process::Command;
use windows::Win32::{
    Foundation::{CloseHandle, HWND, LPARAM, WPARAM},
    System::Threading::{OpenProcess, PROCESS_TERMINATE},
    UI::WindowsAndMessaging::{
        EnumWindows, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId, PostMessageW,
        WM_CLOSE,
    },
};

/// Check if any version of Autodesk Revit is currently running
pub fn is_revit_running() -> Result<bool, String> {
    // Common Revit process names across different versions
    let revit_process_names = [
        "Revit.exe",
        "Revit2024.exe",
        "Revit2025.exe",
        "Revit2026.exe",
        "Revit2027.exe",
    ];

    for process_name in &revit_process_names {
        if is_process_running(process_name)? {
            return Ok(true);
        }
    }

    Ok(false)
}

/// Get a list of all running Revit processes with their window titles
pub fn get_running_revit_processes() -> Result<Vec<RevitProcessInfo>, String> {
    let mut revit_processes = Vec::new();

    // Common Revit process names
    let revit_process_names = [
        "Revit.exe",
        "Revit2024.exe",
        "Revit2025.exe",
        "Revit2026.exe",
        "Revit2027.exe",
    ];

    for process_name in &revit_process_names {
        let pids = get_process_ids_by_name(process_name)?;
        for pid in pids {
            // For each Revit process, try to find its main window
            if let Ok(process_info) = get_process_info_from_pid(pid) {
                revit_processes.push(process_info);
            }
        }
    }

    Ok(revit_processes)
}

/// Attempt to gracefully close all open Revit windows
/// This sends WM_CLOSE messages to Revit windows, allowing Revit to prompt users to save work
pub fn close_revit_windows() -> Result<CloseRevitResult, String> {
    let running_processes = get_running_revit_processes()?;

    if running_processes.is_empty() {
        return Ok(CloseRevitResult {
            closed_count: 0,
            total_count: 0,
            message: "No Revit processes found".to_string(),
        });
    }

    let mut closed_count = 0;
    let total_count = running_processes.len();

    println!("Found {} Revit processes:", total_count);
    for (i, process_info) in running_processes.iter().enumerate() {
        println!(
            "  {}. PID: {}, Title: '{}', HWND: {:?}",
            i + 1,
            process_info.process_id,
            process_info.window_title,
            process_info.hwnd.0
        );

        if process_info.hwnd.0 != 0 {
            if let Ok(()) = send_close_message_to_window(process_info.hwnd) {
                closed_count += 1;
                println!("    -> Successfully sent close message");
            } else {
                println!("    -> Failed to send close message");
            }
        } else {
            println!("    -> No window handle found, trying process termination");
            // If no window handle, try to terminate the process directly
            if let Ok(()) = terminate_process(process_info.process_id) {
                closed_count += 1;
                println!("    -> Successfully terminated process");
            } else {
                println!("    -> Failed to terminate process");
            }
        }
    }

    let message = if closed_count == total_count {
        format!(
            "Successfully sent close requests to all {} Revit windows",
            closed_count
        )
    } else {
        format!(
            "Sent close requests to {}/{} Revit windows",
            closed_count, total_count
        )
    };

    Ok(CloseRevitResult {
        closed_count,
        total_count,
        message,
    })
}

// Helper functions

fn is_process_running(process_name: &str) -> Result<bool, String> {
    let output = Command::new("tasklist")
        .args([
            "/FI",
            &format!("IMAGENAME eq {}", process_name),
            "/FO",
            "CSV",
        ])
        .output()
        .map_err(|e| format!("Failed to execute tasklist: {}", e))?;

    let output_str = String::from_utf8_lossy(&output.stdout);

    // If the process is running, the output will contain the process name
    // The CSV format includes headers, so we check if there are more than 1 line
    Ok(output_str.lines().count() > 1)
}

fn get_process_ids_by_name(process_name: &str) -> Result<Vec<u32>, String> {
    let output = Command::new("tasklist")
        .args([
            "/FI",
            &format!("IMAGENAME eq {}", process_name),
            "/FO",
            "CSV",
        ])
        .output()
        .map_err(|e| format!("Failed to execute tasklist: {}", e))?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let mut pids = Vec::new();

    for line in output_str.lines().skip(1) {
        // Skip header
        let parts: Vec<&str> = line.split(',').collect();
        if parts.len() >= 2 {
            if let Ok(pid) = parts[1].trim_matches('"').parse::<u32>() {
                pids.push(pid);
            }
        }
    }

    Ok(pids)
}

fn get_process_executable_path(process_id: u32) -> Option<String> {
    // Use wmic to get the executable path for a process
    let output = Command::new("wmic")
        .args([
            "process",
            "where",
            &format!("ProcessId={}", process_id),
            "get",
            "ExecutablePath",
            "/format:csv",
        ])
        .output();

    match output {
        Ok(output) => {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.contains("ExecutablePath") {
                    continue; // Skip header
                }
                if line.contains("Revit.exe") {
                    let parts: Vec<&str> = line.split(',').collect();
                    if parts.len() >= 2 {
                        let path = parts[1].trim_matches('"').trim();
                        if !path.is_empty() && path != "ExecutablePath" {
                            return Some(path.to_string());
                        }
                    }
                }
            }
        }
        Err(_) => {
            // If wmic fails, try to guess based on common paths
            let common_paths = [
                r"C:\Program Files\Autodesk\Revit 2024\Revit.exe",
                r"C:\Program Files\Autodesk\Revit 2025\Revit.exe",
                r"C:\Program Files\Autodesk\Revit 2026\Revit.exe",
                r"C:\Program Files\Autodesk\Revit 2027\Revit.exe",
            ];

            for path in &common_paths {
                if std::path::Path::new(path).exists() {
                    return Some(path.to_string());
                }
            }
        }
    }

    None
}

fn get_process_info_from_pid(process_id: u32) -> Result<RevitProcessInfo, String> {
    // Use EnumWindows to find windows belonging to this specific process
    let mut found_hwnd = HWND::default();
    let target_pid = process_id;

    let enum_result = unsafe {
        EnumWindows(
            Some(enum_windows_proc_for_pid),
            LPARAM(&mut (found_hwnd, target_pid) as *mut (HWND, u32) as isize),
        )
    };

    // Try to get the executable path for this process
    let executable_path = get_process_executable_path(process_id);

    if enum_result.is_ok() && found_hwnd.0 != 0 {
        let window_title = get_window_title(found_hwnd)?;
        return Ok(RevitProcessInfo {
            hwnd: found_hwnd,
            process_id,
            window_title,
            executable_path,
        });
    }

    // If no window found, create a dummy entry
    Ok(RevitProcessInfo {
        hwnd: HWND::default(),
        process_id,
        window_title: format!("Revit Process (PID: {})", process_id),
        executable_path: None,
    })
}

fn get_process_info_from_window(hwnd: HWND) -> Result<RevitProcessInfo, String> {
    let mut process_id: u32 = 0;
    let thread_id = unsafe { GetWindowThreadProcessId(hwnd, Some(&mut process_id)) };

    if thread_id == 0 {
        return Err("Failed to get process ID from window".to_string());
    }

    let window_title = get_window_title(hwnd)?;

    Ok(RevitProcessInfo {
        hwnd,
        process_id,
        window_title,
        executable_path: None,
    })
}

unsafe extern "system" fn enum_windows_proc_for_pid(
    hwnd: HWND,
    lparam: LPARAM,
) -> windows::Win32::Foundation::BOOL {
    let mut process_id: u32 = 0;
    let _thread_id = unsafe { GetWindowThreadProcessId(hwnd, Some(&mut process_id)) };

    // Get the target PID and found_hwnd from lparam
    let data_ptr = lparam.0 as *mut (HWND, u32);
    let (ref mut found_hwnd, target_pid) = unsafe { *data_ptr };

    // Check if this window belongs to the specific process we're looking for
    if process_id == target_pid {
        // Found a window for our target process, store it
        *found_hwnd = hwnd;
        return windows::Win32::Foundation::BOOL(0); // Stop enumeration
    }

    windows::Win32::Foundation::BOOL(1) // Continue enumeration
}

unsafe extern "system" fn enum_windows_proc(
    hwnd: HWND,
    lparam: LPARAM,
) -> windows::Win32::Foundation::BOOL {
    let mut process_id: u32 = 0;
    let _thread_id = unsafe { GetWindowThreadProcessId(hwnd, Some(&mut process_id)) };

    // Check if this window belongs to a Revit process
    let revit_process_names = [
        "Revit.exe",
        "Revit2024.exe",
        "Revit2025.exe",
        "Revit2026.exe",
        "Revit2027.exe",
    ];

    for process_name in &revit_process_names {
        if let Ok(pids) = get_process_ids_by_name(process_name) {
            if pids.contains(&process_id) {
                // Found a Revit window, store it
                let found_hwnd_ptr = lparam.0 as *mut HWND;
                unsafe { *found_hwnd_ptr = hwnd };
                return windows::Win32::Foundation::BOOL(0); // Stop enumeration
            }
        }
    }

    windows::Win32::Foundation::BOOL(1) // Continue enumeration
}

fn get_window_title(hwnd: HWND) -> Result<String, String> {
    let title_length = unsafe { GetWindowTextLengthW(hwnd) };

    if title_length == 0 {
        return Ok("".to_string());
    }

    let mut title_buffer = vec![0u16; (title_length + 1) as usize];
    let chars_written = unsafe { GetWindowTextW(hwnd, &mut title_buffer) };

    if chars_written == 0 {
        return Ok("".to_string());
    }

    // Convert UTF-16 to String
    let title = String::from_utf16(&title_buffer[..chars_written as usize])
        .map_err(|e| format!("Failed to convert window title to UTF-8: {}", e))?;

    Ok(title)
}

fn send_close_message_to_window(hwnd: HWND) -> Result<(), String> {
    // Try multiple approaches to close the window

    // Method 1: Send WM_CLOSE message
    let result1 = unsafe { PostMessageW(hwnd, WM_CLOSE, WPARAM(0), LPARAM(0)) };

    if result1.is_ok() {
        println!("    -> WM_CLOSE message sent successfully");
        return Ok(());
    }

    // Method 2: Try to terminate the process directly (less graceful)
    // This is a fallback if WM_CLOSE doesn't work
    println!("    -> WM_CLOSE failed, trying process termination");
    Err("WM_CLOSE message failed".to_string())
}

fn terminate_process(process_id: u32) -> Result<(), String> {
    let handle = unsafe {
        OpenProcess(PROCESS_TERMINATE, false, process_id)
            .map_err(|e| format!("Failed to open process {}: {:?}", process_id, e))?
    };

    unsafe {
        windows::Win32::System::Threading::TerminateProcess(handle, 0)
            .map_err(|e| format!("Failed to terminate process {}: {:?}", process_id, e))?
    };

    unsafe { CloseHandle(handle).map_err(|e| format!("Failed to close handle: {:?}", e))? };
    Ok(())
}

// Data structures

#[derive(Debug, Clone)]
pub struct RevitProcessInfo {
    pub hwnd: HWND,
    pub process_id: u32,
    pub window_title: String,
    pub executable_path: Option<String>, // Store the executable path for reopening
}

#[derive(Debug)]
pub struct CloseRevitResult {
    pub closed_count: usize,
    pub total_count: usize,
    pub message: String,
}

#[derive(Debug)]
pub struct ReopenRevitResult {
    pub reopened_count: usize,
    pub total_count: usize,
    pub message: String,
}

/// Store information about Revit processes before closing them
/// This allows us to reopen them later
pub fn close_revit_windows_with_reopen_info()
-> Result<(CloseRevitResult, Vec<RevitProcessInfo>), String> {
    let running_processes = get_running_revit_processes()?;

    if running_processes.is_empty() {
        return Ok((
            CloseRevitResult {
                closed_count: 0,
                total_count: 0,
                message: "No Revit processes found".to_string(),
            },
            Vec::new(),
        ));
    }

    // Store process info for reopening
    let processes_to_reopen = running_processes.clone();

    let mut closed_count = 0;
    let total_count = running_processes.len();

    println!("Found {} Revit processes:", total_count);
    for (i, process_info) in running_processes.iter().enumerate() {
        println!(
            "  {}. PID: {}, Title: '{}', HWND: {:?}",
            i + 1,
            process_info.process_id,
            process_info.window_title,
            process_info.hwnd.0
        );

        if process_info.hwnd.0 != 0 {
            if let Ok(()) = send_close_message_to_window(process_info.hwnd) {
                closed_count += 1;
                println!("    -> Successfully sent close message");
            } else {
                println!("    -> Failed to send close message");
            }
        } else {
            println!("    -> No window handle found, trying process termination");
            // If no window handle, try to terminate the process directly
            if let Ok(()) = terminate_process(process_info.process_id) {
                closed_count += 1;
                println!("    -> Successfully terminated process");
            } else {
                println!("    -> Failed to terminate process");
            }
        }
    }

    let message = if closed_count == total_count {
        format!("Successfully closed all {} Revit processes", closed_count)
    } else {
        format!("Closed {}/{} Revit processes", closed_count, total_count)
    };

    Ok((
        CloseRevitResult {
            closed_count,
            total_count,
            message,
        },
        processes_to_reopen,
    ))
}

/// Reopen Revit windows using stored process information
pub fn reopen_revit_windows(
    processes_to_reopen: &[RevitProcessInfo],
) -> Result<ReopenRevitResult, String> {
    if processes_to_reopen.is_empty() {
        return Ok(ReopenRevitResult {
            reopened_count: 0,
            total_count: 0,
            message: "No Revit processes to reopen".to_string(),
        });
    }

    let mut reopened_count = 0;
    let total_count = processes_to_reopen.len();

    println!("Attempting to reopen {} Revit processes:", total_count);
    for (i, process_info) in processes_to_reopen.iter().enumerate() {
        println!("  {}. Title: '{}'", i + 1, process_info.window_title);

        if let Some(exec_path) = &process_info.executable_path {
            // Try to reopen using the stored executable path
            if let Ok(()) = launch_revit_executable(exec_path) {
                reopened_count += 1;
                println!("    -> Successfully reopened using stored path");
            } else {
                println!("    -> Failed to reopen using stored path");
            }
        } else {
            // Try to reopen using the window title to guess the version
            if let Ok(()) = launch_revit_by_title(&process_info.window_title) {
                reopened_count += 1;
                println!("    -> Successfully reopened using title-based detection");
            } else {
                println!("    -> Failed to reopen using title-based detection");
            }
        }
    }

    let message = if reopened_count == total_count {
        format!(
            "Successfully reopened all {} Revit processes",
            reopened_count
        )
    } else {
        format!(
            "Reopened {}/{} Revit processes",
            reopened_count, total_count
        )
    };

    Ok(ReopenRevitResult {
        reopened_count,
        total_count,
        message,
    })
}

/// Launch Revit using a specific executable path
fn launch_revit_executable(exec_path: &str) -> Result<(), String> {
    let result = Command::new(exec_path)
        .spawn()
        .map_err(|e| format!("Failed to launch Revit at {}: {}", exec_path, e))?;

    if result.id() > 0 {
        Ok(())
    } else {
        Err("Failed to launch Revit process".to_string())
    }
}

/// Launch Revit by detecting the version from the window title
fn launch_revit_by_title(title: &str) -> Result<(), String> {
    println!(
        "    -> Attempting to detect Revit version from title: '{}'",
        title
    );

    // Common Revit installation paths
    let revit_paths = [
        r"C:\Program Files\Autodesk\Revit 2027\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2026\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2025\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2024\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2023\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2022\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2021\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2020\Revit.exe",
        r"C:\Program Files\Autodesk\Revit 2019\Revit.exe",
    ];

    // Try to detect version from title
    let version = if title.contains("2027") {
        "2027"
    } else if title.contains("2026") {
        "2026"
    } else if title.contains("2025") {
        "2025"
    } else if title.contains("2024") {
        "2024"
    } else if title.contains("2023") {
        "2023"
    } else if title.contains("2022") {
        "2022"
    } else if title.contains("2021") {
        "2021"
    } else if title.contains("2020") {
        "2020"
    } else if title.contains("2019") {
        "2019"
    } else {
        println!("    -> No version detected in title, defaulting to 2024");
        "2024"
    }; // Default to 2024 instead of 2027

    println!("    -> Detected version: {}", version);

    // Try the specific version path first
    let specific_path = format!(r"C:\Program Files\Autodesk\Revit {}\Revit.exe", version);
    println!("    -> Trying specific path: {}", specific_path);

    if std::path::Path::new(&specific_path).exists() {
        println!("    -> Found specific version path, launching...");
        return launch_revit_executable(&specific_path);
    } else {
        println!("    -> Specific version path not found");
    }

    // Fallback: try all paths in order (newest to oldest)
    println!("    -> Trying fallback paths...");
    for path in &revit_paths {
        println!("    -> Checking: {}", path);
        if std::path::Path::new(path).exists() {
            println!("    -> Found fallback path, launching: {}", path);
            return launch_revit_executable(path);
        }
    }

    println!("    -> No Revit installation found, trying start command");
    // Last resort: try using the start command
    let result = Command::new("start")
        .arg("revit")
        .spawn()
        .map_err(|e| format!("Failed to launch Revit using start command: {}", e))?;

    if result.id() > 0 {
        Ok(())
    } else {
        Err("Failed to launch Revit using any method".to_string())
    }
}
