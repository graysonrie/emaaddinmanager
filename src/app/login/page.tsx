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
          // Extract token directly from URL (new approach)
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get("token");
          const error = urlObj.searchParams.get("error");

          if (error) {
            console.error("OAuth error:", error);
            return;
          }

          if (token) {
            console.log("Received token:", token);

            // Store the token directly (no exchange needed)
            await update("accessToken", token);

            // Optional: You might want to get user info with this token
            try {
              const userInfoResponse = await fetch(`${API_BASE_URL}/userinfo`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                console.log("User info:", userInfo);
                // Store additional user info if needed
                await update("userInfo", userInfo);
              }
            } catch (userInfoError) {
              console.warn("Could not fetch user info:", userInfoError);
            }

            console.log("Authentication successful");
            // Redirect to dashboard or next step
            router.replace("/dashboard");
          } else {
            console.error("No token found in URL");
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
