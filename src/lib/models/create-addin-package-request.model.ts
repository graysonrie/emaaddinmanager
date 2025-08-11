export interface CreateAddinPackageRequestModel {
  addinVersion: string;
  pathToHelpFile: string | null;
  pathToImageFile: string;
  displayName: string;
  disciplinePackage: string | null;
  emoji: string | null;
}
