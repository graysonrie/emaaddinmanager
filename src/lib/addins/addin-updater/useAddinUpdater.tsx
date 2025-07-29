import { useEffect, useState, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { useAddinUpdaterStore } from "./useAddinUpdaterStore";
import { usePathname } from "next/navigation";

interface AddinUpdaterProps {
  onNewNotifications?: (notifications: UpdateNotificationModel[]) => void;
}

const DEBOUNCE_TIME = 1000;

export function useAddinUpdater({
  onNewNotifications,
}: AddinUpdaterProps = {}) {
  const unlistenRef = useRef<UnlistenFn | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const {
    updateNotifications,
    addUpdateNotifications,
    clearUpdateNotifications,
    addPendingNotifications,
    flushPendingNotifications,
    clearPendingNotifications,
  } = useAddinUpdaterStore();

  const isOnNotificationsPage = pathname === "/dashboard/notifications";

  // Function to start or restart the debounce timer
  const startDebounceTimer = () => {
    // Clear existing timer if any
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const flushedNotifications = flushPendingNotifications();

      // Show notifications if we're not on the notifications page
      if (!isOnNotificationsPage && flushedNotifications.length > 0) {
        onNewNotifications?.(flushedNotifications);
      }

      debounceTimerRef.current = null;
    }, DEBOUNCE_TIME);
  };

  useEffect(() => {
    if (unlistenRef.current) {
      console.warn("Addin updates listener already set up");
      return;
    }

    console.log("Setting up addin updates listener");
    const unlisten = listen<UpdateNotificationModel[]>(
      "addin_updates_available",
      (event) => {
        console.log("Received addin updates:", event.payload);

        // Add to pending notifications instead of immediately adding to main list
        addPendingNotifications(event.payload);

        // Start or restart the debounce timer
        startDebounceTimer();
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
      // Clear any pending timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      // Clear any pending notifications
      clearPendingNotifications();
    };
  }, [isOnNotificationsPage]); // Add isOnNotificationsPage to dependencies

  return {
    updateNotifications,
    clearUpdateNotifications,
  };
}
