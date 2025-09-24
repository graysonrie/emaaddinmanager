export type UserRole = "user" | "admin" | "superAdmin";

export interface UserResponseModel {
  email: string;
  name: string;
  role: UserRole;
  disciplines: string[];
}
