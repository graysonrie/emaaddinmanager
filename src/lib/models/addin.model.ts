export interface AddinModel {
  // Full path to the .addin file
  pathToAddinXmlFile: string;
  // Full path to the file with the DLLs for the addin
  pathToAddinDllFolder: string;

  // The name of the addin
  name: string;
  // The ID of the addin
  addinId: string;
  // The version of the addin
  version: string;
  // The vendor of the addin
  vendor: string;
  // The email of the vendor
  email: string;
  // The type of the addin. Application, Command, etc.
  addinType: string;
  // The description of the addin
  vendorDescription: string;
  // The Revit version that the addin is installed in. Will only be present if the addin is installed locally
  revitVersion: string | null;
  // Whether the addin is installed locally
  isInstalledLocally: boolean;
}
