// tauri-http.ts
import { SERVER_ENDPOINTS } from ".";

export async function serverRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  retry = true
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5043";
  try {
    const url = `${baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    // If unauthorized and we haven't retried yet, the token might be expired
    if (response.status === 401 && retry) {
      console.log("Token might be expired, attempting to refresh...");

      // The server middleware will handle token refresh automatically
      // Just retry the request once
      return serverRequest<T>(endpoint, method, body, false);
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json() as T;
  } catch (error) {
    console.warn("Request failed:", error);
    throw error;
  }
}
