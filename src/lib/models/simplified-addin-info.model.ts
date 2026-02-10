export interface SimplifiedAddinInfoModel {
  name: string;
  vendorId: string;
  email: string;
  description: string;
  csharpProjectName: string;
  addinVersion: string;
  reasonForExport: string | null;
}

export function getEmptySimplifiedAddinInfo(): SimplifiedAddinInfoModel {
  return {
    name: "",
    vendorId: "",
    email: "",
    description: "",
    csharpProjectName: "",
    addinVersion: "0",
    reasonForExport: null,
  };
}
