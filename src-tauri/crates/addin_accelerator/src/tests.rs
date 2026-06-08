use crate::{
    addin_dll_folder_into_zip, create_zips_for_addin_dll_folders_recursive,
    unzip_folder_contents_into,
};

#[test]
fn to_zip_and_unzip() {
    let folder = "C:\\Users\\GRieger\\Desktop\\AddinTest\\EMAELECTRICAL";

    addin_dll_folder_into_zip(folder).unwrap();

    let path_to_output_folder = "C:\\Users\\GRieger\\Desktop\\AddinTest\\Output";
    let path_to_zip_file = "C:\\Users\\GRieger\\Desktop\\AddinTest\\EMAELECTRICAL_ZIP";

    unzip_folder_contents_into(path_to_zip_file, path_to_output_folder).unwrap();
}

#[test]
fn create_zip_folders_recursive() {
    let folder = "C:\\Users\\GRieger\\Desktop\\AddinTest";

    create_zips_for_addin_dll_folders_recursive(folder).unwrap();
}
