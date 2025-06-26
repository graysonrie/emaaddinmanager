

pub struct LocalAddinsService{

}

impl LocalAddinsService{
    /// Typically C:\Users\<username>\AppData\Roaming\Autodesk\Revit\Addins\2024
    fn path_to_local_addins_folder() -> String{
        let path = dirs::data_local_dir().unwrap().join("Autodesk").join("Revit").join("Addins");
        path.to_str().unwrap().to_string()
    }

    /// Returns a list of all the Revit versions that have addins installed
    /// 
    /// Example: ["2024", "2025", "2026"]
    pub fn get_revit_versions() -> Vec<String>{
        let path = Self::path_to_local_addins_folder();
        let mut versions = Vec::new();
        for entry in std::fs::read_dir(path).unwrap(){
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir(){
                let version = path.file_name().unwrap().to_str().unwrap().to_string();
                versions.push(version);
            }
        }
        versions
    }

    

}