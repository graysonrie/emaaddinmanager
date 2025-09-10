use std::{os::windows::process::CommandExt, process::Command};

const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn no_window_cmd<'a, S>(program: S) -> Command
where
    S: AsRef<std::ffi::OsStr>,
{
    let mut cmd = Command::new(program);
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}
