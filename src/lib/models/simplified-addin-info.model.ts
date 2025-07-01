export interface SimplifiedAddinInfoModel {
  name: string;
  vendor_id: string;
  email: string;
  description: string;
}

export function getEmptySimplifiedAddinInfo(): SimplifiedAddinInfoModel {
  return {
    name: "",
    vendor_id: "",
    email: "",
    description: "",
  };
}
