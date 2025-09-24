export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5043";

// Debug logging
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL: API_BASE_URL,
});

export const SERVER_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  USER_CLAIMS: `${API_BASE_URL}/api/user/claims`,
  USER_GET_USERS: `${API_BASE_URL}/api/user/get-users`,
  USER_ME: `${API_BASE_URL}/api/user/me`,
  USER_CREATE_ME_AS_ADMIN: `${API_BASE_URL}/api/user/create-me-as-admin`,
  USER_CREATE_ME: `${API_BASE_URL}/api/user/create-me`,
  USER_UPDATE_ME: `${API_BASE_URL}/api/user/update-me`,
  USER_DELETE_USER: `${API_BASE_URL}/api/user/delete-user`,
  USER_GET_ROLE: `${API_BASE_URL}/api/user/get-role`,
  USER_GET_ROLE_FROM_EMAIL: `${API_BASE_URL}/api/user/get-role-from-email`,
  DEBUG_TOKEN: `${API_BASE_URL}/api/debug-token`,
} as const;
