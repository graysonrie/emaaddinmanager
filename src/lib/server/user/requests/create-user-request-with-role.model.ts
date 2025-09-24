import { UserRole } from "../responses/user-response.model";

export interface CreateUserRequestWithRoleModel {
  name: string;
  disciplines: string[];
  role: UserRole;
  adminKey: string;
}
