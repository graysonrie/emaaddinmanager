import { AddinModel } from "./addin.model";

export interface InstallAddinRequestModel {
  addin: AddinModel;
  forRevitVersions: string[];
}