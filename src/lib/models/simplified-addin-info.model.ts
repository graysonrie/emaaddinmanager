export interface SimplifiedAddinInfoModel {
  name: string;
  vendorId: string;
  email: string;
  description: string;
  csharpProjectName: string;
  addinVersion: string;
}

export function getEmptySimplifiedAddinInfo(): SimplifiedAddinInfoModel {
  return {
    name: "",
    vendorId: "",
    email: "",
    description: "",
    csharpProjectName: "",
    addinVersion: "0",
  };
}
