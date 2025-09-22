// tauri-http.ts
import useConfig from "../persistence/config/useConfig";
import { useConfigValue } from "../persistence/config/useConfigValue";
import { useKeyValueSubscription } from "../persistence/useKeyValueSubscription";
import { SERVER_ENDPOINTS } from ".";

// export default function useServerRequests() {
//   const accessToken = useKeyValueSubscription<string>("accessToken");

//   async function request<T>(
//     endpoint: keyof typeof SERVER_ENDPOINTS,
//     method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
//     body?: unknown,
//     retry = true
//   ): Promise<T> {
//     if (!accessToken) {
//       throw new Error("No access token found. Please login first.");
//     }

//     try {
//       const response = await fetch(SERVER_ENDPOINTS[endpoint], {
//         method,
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json",
//           ...(body ? { "Content-Type": "application/json" } : {}),
//         },
//         body: body ? JSON.stringify(body) : undefined,
//       });

//       // If unauthorized and we haven't retried yet, the token might be expired
//       if (response.status === 401 && retry) {
//         console.log("Token might be expired, attempting to refresh...");

//         // The server middleware will handle token refresh automatically
//         // Just retry the request once
//         return request<T>(endpoint, method, body, false);
//       }

//       if (!response.ok) {
//         const errorData = await response
//           .json()
//           .catch(() => ({ error: "Unknown error" }));
//         throw new Error(
//           errorData.error || `HTTP ${response.status}: ${response.statusText}`
//         );
//       }

//       return response.json() as T;
//     } catch (error) {
//       console.error("Request failed:", error);
//       throw error;
//     }
//   }

//   return { request };
// }

export default function useServerRequests() {
  async function request<T>(
    endpoint: keyof typeof SERVER_ENDPOINTS,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: unknown,
    retry = true
  ): Promise<T> {
    try {
      const response = await fetch(SERVER_ENDPOINTS[endpoint], {
        method,
        headers: {
          Credentials: "include",
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // If unauthorized and we haven't retried yet, the token might be expired
      if (response.status === 401 && retry) {
        console.log("Token might be expired, attempting to refresh...");

        // The server middleware will handle token refresh automatically
        // Just retry the request once
        return request<T>(endpoint, method, body, false);
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
      console.error("Request failed:", error);
      throw error;
    }
  }

  return { request };
}
