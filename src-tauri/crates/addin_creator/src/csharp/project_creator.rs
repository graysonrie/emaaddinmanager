use std::io;
use std::path::Path;
use std::process::{Command, Stdio};

use crate::no_window_cmd::no_window_cmd;

fn run(cmd: &mut Command) -> io::Result<()> {
    let status = cmd
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()?;
    if !status.success() {
        Err(io::Error::other(format!(
            "Command failed: {:?} (code {:?})",
            cmd,
            status.code()
        )))
    } else {
        Ok(())
    }
}

/// Install a dotnet template (folder or NuGet ID)
pub fn install_template(template_ref: &str) -> io::Result<()> {
    // Try modern syntax first; fall back to legacy if needed.
    let mut try_modern = no_window_cmd("dotnet");
    try_modern.args(["new", "install", template_ref]);
    match run(&mut try_modern) {
        Ok(()) => Ok(()),
        Err(_) => {
            let mut legacy = no_window_cmd("dotnet");
            legacy.args(["new", "--install", template_ref]);
            run(&mut legacy)
        }
    }
}

/// Generate a project from the installed template.
pub fn generate_project(
    short_name: &str,
    name: &str,
    out_dir: &Path,
    extra_params: &[(&str, &str)], // e.g. &[("framework","net8.0"), ("myParam","Foo")]
) -> io::Result<()> {
    let mut cmd = no_window_cmd("dotnet");
    cmd.args(["new", short_name, "-n", name, "-o"]);
    cmd.arg(out_dir);

    for (k, v) in extra_params {
        // each symbol becomes `--key value`
        cmd.arg(format!("--{}", k)).arg(*v);
    }

    run(&mut cmd)
}