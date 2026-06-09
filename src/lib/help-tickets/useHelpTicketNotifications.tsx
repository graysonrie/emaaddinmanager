"use client";

import { useAuthStore } from "@/lib/auth/useAuthStore";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { HelpTicketUpdateNotificationModel } from "@/lib/models/help-tickets/help-ticket-update-notification.model";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useHelpTicketNotificationsStore } from "./useHelpTicketNotificationsStore";

const POLL_INTERVAL_MS = 60_000;

interface Props {
  onNewNotifications?: (
    notifications: HelpTicketUpdateNotificationModel[],
  ) => void;
}

export function useHelpTicketNotifications({ onNewNotifications }: Props = {}) {
  const userEmail = useConfigValue("userEmail");
  const pathname = usePathname();
  const { addNotifications } = useHelpTicketNotificationsStore();
  const isOnNotificationsPage = pathname === "/dashboard/notifications";
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!userEmail) {
      return;
    }

    const poll = async () => {
      if (isPollingRef.current) {
        return;
      }

      isPollingRef.current = true;
      try {
        const adminStatus = await useAuthStore.getState().amIAnAdmin();
        const isRealAdmin =
          adminStatus === "admin" || adminStatus === "super";

        const updates = await getTauriCommands().checkForTicketUpdates(
          userEmail,
          !isRealAdmin,
          isRealAdmin,
        );

        if (updates.length > 0) {
          addNotifications(updates);
          if (!isOnNotificationsPage) {
            onNewNotifications?.(updates);
          }
        }
      } catch (err) {
        console.error("Failed to check for help ticket updates:", err);
      } finally {
        isPollingRef.current = false;
      }
    };

    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [userEmail, isOnNotificationsPage, addNotifications, onNewNotifications]);
}
