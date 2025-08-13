use std::path::Path;

mod dll_checker;

fn main() {
    let dlls_path = Path::new(
        "C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry\\All Versions\\EMABASES",
    );
    let revit_dlls_path = Path::new("C:\\Program Files\\Autodesk\\Revit 2025");

    let dlls = dll_checker::check_against_revit_dlls(dlls_path, revit_dlls_path).unwrap();

    println!("{:?}", dlls);
}
