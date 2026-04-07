import { UserModel } from "@/lib/models/user.model";
import { httpClient } from "../httpClient";

interface BackendUserResponse {
  userEmail: string;
  userName: string;
  discipline: string;
  role: string;
  allowedAddinIds: string[];
  allowedAddinPaths: string[];
}

export async function getUser(email: string): Promise<UserModel | undefined> {
  const { data } = await httpClient.get<BackendUserResponse | null>(
    `/users/${encodeURIComponent(email)}`
  );
  if (!data) {
    return undefined;
  }
  return {
    userEmail: data.userEmail,
    discipline: data.discipline,
    allowedAddinIds: data.allowedAddinIds,
    allowedAddinPaths: data.allowedAddinPaths,
  };
}

export async function setAllowedAddinPathsForUser(
  email: string,
  addinPaths: string[]
): Promise<void> {
  await httpClient.put(`/users/${encodeURIComponent(email)}/allowed-addin-paths`, {
    addinPaths,
  });
}
