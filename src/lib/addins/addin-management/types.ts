import getTauriCommands from "@/lib/commands/getTauriCommands";

export interface AddinPermissionModel {
  relativePathToAddin: string;
  displayName: string;
  forDiscipline: string;
  emoji: string;
  image?: string;
  isPublic: boolean;
  helpFilePath?: string;

  referenceAddinPackage: AddinPackageInfoModel;
}

// Import the addin package model
import { AddinPackageInfoModel } from "@/lib/models/addin-package-info.model";

// Convert addin packages to permissions
export function convertPackagesToPermissions(
  packages: AddinPackageInfoModel[]
): AddinPermissionModel[] {
  return packages.map((pkg) => ({
    relativePathToAddin: pkg.relativePathToAddin,
    displayName: pkg.displayName,
    forDiscipline: pkg.disciplinePackage ?? "",
    emoji: pkg.emoji || "📦", // Default emoji if none provided
    image: pkg.relativePathToImage
      ? `/images/${pkg.relativePathToImage}`
      : undefined,
    isPublic:
      pkg.disciplinePackage !== null && pkg.disciplinePackage !== undefined, // All discipline packages are public
    helpFilePath: pkg.relativePathToHelpFile,
    referenceAddinPackage: pkg,
  }));
}

// Get permissions from packages instead of hardcoded constants
export async function getPermissionsFromPackages(): Promise<
  AddinPermissionModel[]
> {
  try {
    const packages = await getTauriCommands().getAllAddinPackages();
    return convertPackagesToPermissions(packages);
  } catch (error) {
    console.error("Failed to load permissions from packages:", error);
    return [];
  }
}

export async function AllPublicAddinPermissions(): Promise<
  AddinPermissionModel[]
> {
  // For now, return the hardcoded permissions
  // TODO: Replace with getPermissionsFromPackages() when ready
  const permissions = await getPermissionsFromPackages();
  return permissions.filter((permission) => permission.isPublic);
}

// // ! Prefer using AllPublicAddinPermissions() instead of this constant
// export const GLOBAL_DEFAULT_ADDIN_PERMISSIONS: AddinPermissionModel[] = [
//   {
//     relativePathToAddin: "All Versions/EMABASES",
//     displayName: "EMA Bases",
//     forDiscipline: "Bases",
//     emoji: "🏠",
//     image: "/images/bg1.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMAELECTRICAL",
//     displayName: "EMA Electrical",
//     forDiscipline: "Electrical",
//     emoji: "⚡",
//     image: "/images/bg2.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMALIGHTING",
//     displayName: "EMA Lighting",
//     forDiscipline: "Lighting",
//     emoji: "💡",
//     image: "/images/bg3.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMAMECHANICAL",
//     displayName: "EMA Mechanical",
//     forDiscipline: "Mechanical",
//     emoji: "⚙️",
//     image: "/images/bg4.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMAPLUMBING",
//     displayName: "EMA Plumbing",
//     forDiscipline: "Plumbing",
//     emoji: "💧",
//     image: "/images/bg5.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMATECHNOLOGY",
//     displayName: "EMA Technology",
//     forDiscipline: "Technology",
//     emoji: "🤖",
//     image: "/images/bg6.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/EMASHREVEPORT",
//     displayName: "EMA Shreveport",
//     forDiscipline: "Shreveport",
//     emoji: "🏙️",
//     image: "/images/bg7.jpg",
//     isPublic: true,
//   },
//   {
//     relativePathToAddin: "All Versions/Misc/TabColorizer",
//     displayName: "Tab Colorizer",
//     forDiscipline: "Technology",
//     emoji: "🏙️",
//     image: "/images/paintbrush-logo.png",
//     isPublic: false,
//   },
// ];
