"use client";
import { API_BASE_URL, SERVER_ENDPOINTS } from "@/lib/server";
import { useEffect, useState } from "react";
import {
  start,
  cancel,
  onUrl,
  onInvalidUrl,
} from "@fabianlars/tauri-plugin-oauth";
import { Button } from "@/components/ui/button";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { redirect, useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [port, setPort] = useState(7000);
  const startOAuthServer = async () => {
    try {
      const port = await start({ ports: [7000] });
      setPort(port);
      console.log(`OAuth server started on port ${port}`);

      // Set up listeners for OAuth results
      await onUrl(async (url) => {
        console.log("Received OAuth URL:", url);

        try {
          // Extract authorization code from URL
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");
          const state = urlObj.searchParams.get("state");
          const error = urlObj.searchParams.get("error");

          if (error) {
            console.error("OAuth error:", error);
            return;
          }

          if (code && state) {
            // Exchange code for tokens
            const response = await fetch(SERVER_ENDPOINTS.EXCHANGE_TOKEN, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code, port, state }),
            });

            if (response.ok) {
              const tokenData = await response.json();

              console.log("tokenData", tokenData);

              // Store tokens securely in your key-value store
              const { kvStoreSet } = getTauriCommands();
              await kvStoreSet("accessToken", tokenData.access_token);
              await kvStoreSet("refreshToken", tokenData.refresh_token);

              console.log("Authentication successful");
              // Redirect to dashboard or next step
              router.replace("/dashboard");
            } else {
              console.error("Failed to exchange code for tokens");
            }
          } else {
            console.error("No code or state found");
            console.log("Code:", code);
            console.log("State:", state);
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
    const loginUrl = `${SERVER_ENDPOINTS.LOGIN}?tauri_port=${port}`;
    window.open(loginUrl, "_blank");
  }
  useEffect(() => {
    const start = async () => {
      // await stopOAuthServer();
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
