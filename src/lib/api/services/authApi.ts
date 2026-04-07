import { httpClient, setAccessToken } from "../httpClient";

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function login(email: string, password: string): Promise<AuthTokenResponse> {
  const { data } = await httpClient.post<AuthTokenResponse>("/auth/login", {
    email,
    password,
  });
  setAccessToken(data.access_token);
  return data;
}

export async function register(
  email: string,
  name: string,
  discipline: string,
  password: string
): Promise<AuthTokenResponse> {
  const { data } = await httpClient.post<AuthTokenResponse>("/auth/register", {
    email,
    name,
    discipline,
    password,
  });
  setAccessToken(data.access_token);
  return data;
}

export async function setPasswordForUser(email: string, password: string): Promise<void> {
  await httpClient.post(`/auth/set-password/${encodeURIComponent(email)}`, {
    password,
  });
}

export async function setTemporaryPassword(email: string): Promise<string> {
  const { data } = await httpClient.post<{ temporaryPassword: string }>(
    "/auth/set-temp-password",
    {
      email,
    }
  );
  return data.temporaryPassword;
}
