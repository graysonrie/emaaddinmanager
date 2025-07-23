import { useEffect, useState, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { useAddinUpdaterStore } from "./useAddinUpdaterStore";

export function useAddinUpdater() {
  const unlistenRef = useRef<UnlistenFn | null>(null);
  const { updateNotifications, setUpdateNotifications } =
    useAddinUpdaterStore();

  useEffect(() => {
    console.log("Setting up addin updates listener");

    const unlisten = listen<UpdateNotificationModel[]>(
      "addin_updates_available",
      (event) => {
        console.log("Received addin updates:", event.payload);
        setUpdateNotifications(event.payload);
      }
    );

    // Store the unlisten function when it's ready
    unlisten.then((fn) => {
      unlistenRef.current = fn;
      console.log("Addin updates listener is now active");
    });

    return () => {
      console.log("Cleaning up addin updates listener");
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  const clearNotifications = () => {
    setUpdateNotifications([]);
  };

  return {
    updateNotifications,
    clearNotifications,
  };
}
