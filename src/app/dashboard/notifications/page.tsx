"use client";

import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";
import AddinUpdateNotificationCard from "./AddinUpdateNotificationCard";
import PageWrapper from "@/components/PageWrapper";
import { CheckForUpdatesButton } from "./CheckForUpdatesButton";
import { RevitStatusIndicator } from "./RevitStatusIndicator";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { Info } from "lucide-react";

export default function NotificationsPage() {
  const { updateNotifications, clearNotifications } = useAddinUpdater();



  return (
    <PageWrapper>
      <div className="flex justify-center h-full">
        <div className="w-full max-w-4xl flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between ">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex items-center gap-3">
              <RevitStatusIndicator />
              <CheckForUpdatesButton />
              {updateNotifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto thin-scrollbar">
            {updateNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Info className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No updates available</h3>
                <p className="text-muted-foreground">All addins are up to date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updateNotifications.map((notification, index) => (
                  <AddinUpdateNotificationCard
                    key={index}
                    notification={notification}
                    onDismiss={() => {
                      // Remove this specific notification
                      const newNotifications = updateNotifications.filter(
                        (_, i) => i !== index
                      );
                      // This would need to be handled by the hook, but for now we'll just clear all
                      clearNotifications();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
