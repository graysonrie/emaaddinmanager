export interface SimplifiedAddinInfoModel {
  name: string;
  vendorId: string;
  email: string;
  description: string;
  csharpProjectName: string;
}

export function getEmptySimplifiedAddinInfo(): SimplifiedAddinInfoModel {
  return {
    name: "",
    vendorId: "",
    email: "",
    description: "",
    csharpProjectName: "",
  };
}
