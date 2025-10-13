import { UserResponseModel } from "../../user/responses/user-response.model";

export interface AddinResponseModel {
  id: string;
  name: string;
  addinId: string;
  version: string;
  vendor: string;
  email: string;
  addinType: string;
  vendorDescription: string;
  revitVersions: string[];
  isInstalledLocally: boolean;
  owner: UserResponseModel;
  nestedPaths: string;
}
