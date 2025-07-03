import { AddinModel } from "@/lib/models/addin.model";
import getTauriCommands from "@/lib/commands/getTauriCommands";

/**
 * Determines the Revit versions that the addin is compatible with
 * @param addin - The addin to determine the Revit versions for
 * @returns The Revit versions that the addin is compatible with
 */
export async function determineRevitVersions(addin: AddinModel) {
  const { getRevitVersions } = getTauriCommands();
  const path = addin.pathToAddinDllFolder;
  const versions = await getRevitVersions();
  const version = versions.find((v) => path.includes(v));
  if (version) {
    return [version];
  }
  // Return all versions if no version is specified in the addin's file path,
  // this is the case for addins that are not specific to a Revit version
  return versions;
}
