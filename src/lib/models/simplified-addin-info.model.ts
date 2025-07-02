export interface SimplifiedAddinInfoModel {
  name: string;
  vendorId: string;
  email: string;
  description: string;
}

export function getEmptySimplifiedAddinInfo(): SimplifiedAddinInfoModel {
  return {
    name: "",
    vendorId: "",
    email: "",
    description: "",
  };
}
