// tauri-http.ts
import useConfig from "../persistence/config/useConfig";
import { useConfigValue } from "../persistence/config/useConfigValue";
import { useKeyValueSubscription } from "../persistence/useKeyValueSubscription";
import { SERVER_ENDPOINTS } from ".";

export async function serverRequest<T>(
  endpoint: keyof typeof SERVER_ENDPOINTS,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  retry = true
): Promise<T> {
  try {
    const url = SERVER_ENDPOINTS[endpoint];

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
