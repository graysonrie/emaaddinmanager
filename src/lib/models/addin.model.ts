import { getFileNameFromPath, getParentDirectoryFromPath } from "../utils";

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

/**
 * Get the name of the C# project that contains the addin.
 * @param addin The addin to get the name of the C# project for.
 * @returns The name of the C# project that contains the addin minus the .csproj extension.
 */
export function getAddinCsharpProjectName(addin: AddinModel) {
  const name = getFileNameFromPath(addin.pathToAddinDllFolder);
  return name;
}
