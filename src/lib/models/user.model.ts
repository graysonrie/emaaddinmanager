export interface UserModel {
  userEmail: string;
  allowedAddinIds: string[];
  allowedAddinPaths: string[];
  blockedAddinPaths: string[];
  discipline: string;
}
