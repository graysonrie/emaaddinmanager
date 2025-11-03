"use client";
import { API_BASE_URL, SERVER_ENDPOINTS } from "@/lib/server";
import { useEffect, useRef, useState } from "react";
import { start, cancel, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import useConfig from "@/lib/persistence/config/useConfig";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [port, setPort] = useState(7000);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const popupWindowRef = useRef<Window | null>(null);
  const firstOpen = useRef(true);

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

            const popupWindow = popupWindowRef.current;

            // Close the popup window if it exists
            if (popupWindow && !popupWindow.closed) {
              popupWindow.close();
              popupWindowRef.current = null;
            }

            // Test if we can make authenticated requests with cookies
            try {
              setError(undefined);
              setShowRetry(false);
              const userInfoResponse = await fetch(
                `${API_BASE_URL}/api/user/me`,
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

                console.log("Authentication successful");
                // Redirect to dashboard or next step
                stopOAuthServer();
                router.replace("/dashboard");
              } else {
                console.warn(
                  "Could not fetch user info:",
                  userInfoResponse.status
                );
                setShowRetry(true);
                setError("Error logging in");
              }
            } catch (userInfoError) {
              console.warn("Could not fetch user info:", userInfoError);
              setShowRetry(true);
              setError("Error logging in");
            }
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
    if (popupWindowRef.current) {
      popupWindowRef.current.close();
      popupWindowRef.current = null;
      console.log("closed popup window");
    } else {
      console.log("Coundnt close popup cause it does not exist");
    }
    try {
      await cancel(port);
      console.log("OAuth server stopped");
    } catch (error) {
      console.warn("Error stopping OAuth server:", error);
    }
  }

  async function openLoginWindow() {
    if (!popupWindowRef.current) {
      // Updated to use the new login endpoint
      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      // Open window with specific dimensions and store reference
      const popup = window.open(
        loginUrl,
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );
      popupWindowRef.current = popup;
    }
  }

  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Check if user is already authenticated before opening login window
  const checkAuthentication = async () => {
    try {
      const userInfoResponse = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        console.log("User already authenticated:", userInfo);
        // Store user info for local use
        await update("userInfo", userInfo);
        // Redirect to dashboard immediately without opening login window
        router.replace("/dashboard");
        return true;
      }
      return false;
    } catch (error) {
      console.log("User not authenticated, will show login window");
      return false;
    }
  };

  useEffect(() => {
    if (firstOpen.current) {
      const initialize = async () => {
        setIsCheckingAuth(true);
        const isAuthenticated = await checkAuthentication();

        if (!isAuthenticated) {
          // Only start OAuth server and open login window if not authenticated
          await startOAuthServer();
          openLoginWindow();
        }

        setIsCheckingAuth(false);
        firstOpen.current = false;
      };
      initialize();
    }
  }, []);

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
      {showRetry && (
        <Button
          onClick={openLoginWindow}
          className="flex items-center gap-2 cursor-pointer text-primary"
          variant="outline"
        >
          <Icon icon="mdi:microsoft" />
          <p className="text-md font-sans">Retry</p>
        </Button>
      )}
    </div>
  );
}
