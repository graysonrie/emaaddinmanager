"use client";
import { API_BASE_URL, SERVER_ENDPOINTS } from "@/lib/server";
import { useEffect, useState } from "react";
import { start, cancel, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import useConfig from "@/lib/persistence/config/useConfig";

export default function LoginPage() {
  const router = useRouter();
  const [port, setPort] = useState(7000);

  const { update } = useConfig();
  const startOAuthServer = async () => {
    try {
      const port = await start({ ports: [7000] });
      setPort(port);
      console.log(`OAuth server started on port ${port}`);

      // Set up listeners for OAuth results
      await onUrl(async (url) => {
        console.log("Received OAuth URL:", url);

        try {
          const urlObj = new URL(url);
          const success = urlObj.searchParams.get("success");
          const error = urlObj.searchParams.get("error");

          if (error) {
            console.error("OAuth error:", error);
            return;
          }

          if (success === "true") {
            console.log("OAuth authentication successful");

            // Test if we can make authenticated requests with cookies
            try {
              const userInfoResponse = await fetch(
                `${API_BASE_URL}/api/user/profile`,
                {
                  method: "GET",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                console.log("User info:", userInfo);
                // Store user info for local use
                await update("userInfo", userInfo);
              } else {
                console.warn(
                  "Could not fetch user info:",
                  userInfoResponse.status
                );
              }
            } catch (userInfoError) {
              console.warn("Could not fetch user info:", userInfoError);
            }

            console.log("Authentication successful");
            // Redirect to dashboard or next step
            router.replace("/dashboard");
          } else {
            console.error("OAuth authentication failed");
            console.log(
              "Available URL params:",
              Array.from(urlObj.searchParams.entries())
            );
          }
        } catch (error) {
          console.error("Error processing OAuth callback:", error);
        }
      });
    } catch (error) {
      console.error("Error starting OAuth server:", error);
    }
  };

  // Don't forget to stop the server when you're done
  async function stopOAuthServer() {
    try {
      await cancel(port);
      console.log("OAuth server stopped");
    } catch (error) {
      console.error("Error stopping OAuth server:", error);
    }
  }

  async function openLoginWindow() {
    // Updated to use the new login endpoint
    const loginUrl = `${API_BASE_URL}/api/auth/login`;
    window.open(loginUrl, "_blank");
  }

  useEffect(() => {
    const start = async () => {
      await startOAuthServer();
    };
    start();
    return () => {
      stopOAuthServer();
    };
  }, []);

  return (
    <div>
      <Button onClick={openLoginWindow}>log in</Button>
    </div>
  );
}
