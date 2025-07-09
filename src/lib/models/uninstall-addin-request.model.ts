import { AddinModel } from "./addin.model";

export interface UninstallAddinRequestModel {
  addin: AddinModel;
  forRevitVersions: string[];
}
