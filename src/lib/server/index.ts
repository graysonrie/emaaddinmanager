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
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  DEBUG_TOKEN: `${API_BASE_URL}/api/debug-token`,
};
