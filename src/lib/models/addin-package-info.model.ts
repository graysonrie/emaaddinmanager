export interface AddinPackageInfoModel {
  packageInfoVersion: string;
  addinVersion: string;
  relativePathToHelpFile: string | undefined;
  relativePathToImage: string;
  relativePathToAddin: string;
  absolutePathToHelpFile: string | undefined;
  absolutePathToImage: string;
  displayName: string;
  disciplinePackage: string | undefined;
  emoji: string | undefined;
}
