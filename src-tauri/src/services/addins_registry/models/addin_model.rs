
#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all="camelCase")]
pub struct AddinModel{
  /// Full path to the .addin file
  pub path_to_addin_xml_file: String,
  /// Full path to the file with the DLLs for the addin
  pub path_to_addin_dll_folder: String,
  /// The name of the addin
  pub name: String,
  /// The version of the addin
  pub version: String,
  /// The vendor of the addin
  pub vendor: String,
  /// The email of the vendor
  pub email: String,
  /// The type of the addin. Application, Command, etc.
  pub addin_type: String,
}