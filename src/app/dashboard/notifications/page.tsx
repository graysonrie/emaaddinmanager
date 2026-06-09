"use client";

import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";
import { UpdateNotificationWithTime } from "@/lib/addins/addin-updater/update-notification-with-time.model";
import AddinUpdateNotificationCard from "./AddinUpdateNotificationCard";
import HelpTicketUpdateNotificationCard from "./HelpTicketUpdateNotificationCard";
import PageWrapper from "@/components/PageWrapper";
import { CheckForUpdatesButton } from "./CheckForUpdatesButton";
import { RevitStatusIndicator } from "./RevitStatusIndicator";
import { Info } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useMemo } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { HelpTicketNotificationWithTime } from "@/lib/help-tickets/help-ticket-notification-with-time.model";
import {
  helpTicketNotificationKey,
  useHelpTicketNotificationsStore,
} from "@/lib/help-tickets/useHelpTicketNotificationsStore";

type CombinedNotification =
  | { type: "addin"; key: string; time: Date; notification: UpdateNotificationWithTime }
  | {
      type: "helpTicket";
      key: string;
      time: Date;
      notification: HelpTicketNotificationWithTime;
    };

function NotificationsContent() {
  const { updateNotifications, clearUpdateNotifications } = useAddinUpdater();
  const {
    notifications: helpTicketNotifications,
    clearNotifications: clearHelpTicketNotifications,
    dismissNotification,
  } = useHelpTicketNotificationsStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoCheck = searchParams.get("autoCheck");

  useEffect(() => {
    if (autoCheck === "true") {
      const triggerAutoCheck = async () => {
        try {
          console.log("Auto-triggering updates check from AboutAddinModal");
          await getTauriCommands().checkForUpdatesManual();
        } catch (error) {
          console.warn("Failed to auto-trigger updates check:", error);
        }
      };

      triggerAutoCheck();
    }
  }, [autoCheck, router]);

  const combinedNotifications = useMemo(() => {
    const items: CombinedNotification[] = [
      ...updateNotifications.map((notification, index) => ({
        type: "addin" as const,
        key: `addin-${notification.title}-${index}`,
        time: notification.time,
        notification,
      })),
      ...helpTicketNotifications.map((notification) => ({
        type: "helpTicket" as const,
        key: helpTicketNotificationKey(notification),
        time: notification.time,
        notification,
      })),
    ];

    return items.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [updateNotifications, helpTicketNotifications]);

  const hasNotifications = combinedNotifications.length > 0;

  const handleClearAll = () => {
    clearUpdateNotifications();
    clearHelpTicketNotifications();
  };

  return (
    <PageWrapper>
      <div className="flex justify-center h-full">
        <div className="w-full max-w-4xl flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between ">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex items-center gap-3">
              <RevitStatusIndicator />
              <CheckForUpdatesButton />
              {hasNotifications && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto thin-scrollbar">
            {!hasNotifications ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Info className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No notifications
                </h3>
                <p className="text-muted-foreground">
                  Addin updates and help ticket activity will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {combinedNotifications.map((item) =>
                  item.type === "addin" ? (
                    <AddinUpdateNotificationCard
                      key={item.key}
                      notification={item.notification}
                      onDismiss={() => {
                        clearUpdateNotifications();
                      }}
                    />
                  ) : (
                    <HelpTicketUpdateNotificationCard
                      key={item.key}
                      notification={item.notification}
                      onDismiss={() => dismissNotification(item.key)}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <div className="flex justify-center h-full">
            <div className="w-full max-w-4xl flex flex-col gap-6 p-6">
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </PageWrapper>
      }
    >
      <NotificationsContent />
    </Suspense>
  );
}
