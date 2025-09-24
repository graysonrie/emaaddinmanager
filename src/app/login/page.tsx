"use client";
import { API_BASE_URL, SERVER_ENDPOINTS } from "@/lib/server";
import { useEffect, useState } from "react";
import { start, cancel, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import useConfig from "@/lib/persistence/config/useConfig";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [port, setPort] = useState(7000);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

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

            // Close the popup window if it exists
            if (popupWindow && !popupWindow.closed) {
              popupWindow.close();
              setPopupWindow(null);
            }

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
      console.warn("Error stopping OAuth server:", error);
    }
  }

  async function openLoginWindow() {
    // Updated to use the new login endpoint
    const loginUrl = `${API_BASE_URL}/api/auth/login`;
    // Open window with specific dimensions and store reference
    const popup = window.open(
      loginUrl,
      "_blank",
      "width=800,height=600,scrollbars=yes,resizable=yes"
    );
    setPopupWindow(popup);
  }

  useEffect(() => {
    const start = async () => {
      await startOAuthServer();
    };
    start();
    return () => {
      stopOAuthServer();
      // Close popup window if it's still open
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full w-full">
      <div className="flex flex-col gap-2 items-center justify-center">
        <Image
          src="/images/emavector.svg"
          alt="Logo"
          width={200}
          height={200}
        />
        <p className="text-2xl font-bold text-primary font-sans">
          Addin Launcher
        </p>
      </div>
      <Button
        onClick={openLoginWindow}
        className="flex items-center gap-2 cursor-pointer text-primary"
        variant="outline"
      >
        <Icon icon="mdi:microsoft" />
        <p className="text-md font-sans">Log in with Microsoft</p>
      </Button>
    </div>
  );
}
