export interface AddinModel {
  // Full path to the .addin file
  pathToAddinXmlFile: string;
  // Full path to the file with the DLLs for the addin
  pathToAddinDllFolder: string;
  // The name of the addin
  name: string;
  // The version of the addin
  version: string;
  // The vendor of the addin
  vendor: string;
  // The email of the vendor
  email: string;
  // The type of the addin. Application, Command, etc.
  addinType: string;
}