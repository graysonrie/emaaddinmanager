use std::fs;
use std::path::Path;
use rayon::prelude::*;

pub fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dst)?;

    let entries: Vec<_> = fs::read_dir(src)?
        .map(|res| res.map(|e| (e.path(), e.file_type())))
        .collect::<Result<_, _>>()?;

    // Split into files and directories
    let (dirs, files): (Vec<_>, Vec<_>) = entries.into_iter().partition(|(path, file_type)| {
        file_type.as_ref().map(|ft| ft.is_dir()).unwrap_or(false)
    });

    // Copy files in parallel
    files.par_iter().try_for_each(|(src_path, _)| {
        let dst_path = dst.join(src_path.file_name().unwrap());
        fs::copy(src_path, &dst_path)?;
        Ok::<_, std::io::Error>(())
    })?;

    // Recurse into directories (serially)
    for (src_path, _) in dirs {
        let dst_path = dst.join(src_path.file_name().unwrap());
        copy_dir_all(&src_path, &dst_path)?;
    }

    Ok(())
}