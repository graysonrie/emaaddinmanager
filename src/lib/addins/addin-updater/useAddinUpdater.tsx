import { useEffect, useState, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { useAddinUpdaterStore } from "./useAddinUpdaterStore";
import { usePathname } from "next/navigation";

interface AddinUpdaterProps {
  onNewNotifications?: (notifications: UpdateNotificationModel[]) => void;
}

export function useAddinUpdater({
  onNewNotifications,
}: AddinUpdaterProps = {}) {
  const unlistenRef = useRef<UnlistenFn | null>(null);
  const pathname = usePathname();
  const {
    updateNotifications,
    addUpdateNotifications,
    clearUpdateNotifications,
  } = useAddinUpdaterStore();

  const isOnNotificationsPage = pathname === "/dashboard/notifications";

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
        addUpdateNotifications(event.payload);

        // For now, no need to display extra notifications if we are already on the page
        if (!isOnNotificationsPage) {
          onNewNotifications?.(event.payload);
        }
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
  }, [isOnNotificationsPage]); // Add isOnNotificationsPage to dependencies

  return {
    updateNotifications,
    clearUpdateNotifications,
  };
}
