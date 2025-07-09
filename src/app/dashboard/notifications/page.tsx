"use client";

import PageWrapper from "@/components/PageWrapper";
import { useNotificationsStore } from "@/lib/notifications/useNotificationsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useMockNotificationsStore } from "@/lib/notifications/useMockNotificationsStore";
import AddinUpdateNotificationCard from "./AddinUpdateNotificationCard";
import CheckForUpdatesButton from "./CheckForUpdatesButton";
import { useAddinUpdater } from "@/lib/addin-updater/useAddinUpdater";

export default function NotificationsPage() {
  const {
    addinUpdateNotifications,
    hasUserCheckedNotifications,
    setCheckedNotifications,
  } = useNotificationsStore();
  const { isChecking } = useAddinUpdater();
  const [hasCheckedForUpdates, setHasCheckedForUpdates] = useState(false);

  // Set the notifications as checked when the page is loaded
  useEffect(() => {
    setCheckedNotifications();
  }, []);

  // Reset hasCheckedForUpdates when new notifications come in
  useEffect(() => {
    if (addinUpdateNotifications.length > 0) {
      setHasCheckedForUpdates(false);
    }
  }, [addinUpdateNotifications.length]);

  const handleCheckForUpdates = () => {
    setHasCheckedForUpdates(true);
  };

  return (
    <PageWrapper>
      <div className="h-full flex flex-col max-w-screen-md mx-auto">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-8 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {addinUpdateNotifications.length > 0 &&
              !hasUserCheckedNotifications && (
                <Badge variant="destructive" className="ml-2">
                  {addinUpdateNotifications.length} new
                </Badge>
              )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          {addinUpdateNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              {isChecking ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground text-center font-sans">
                    Checking for updates...
                  </p>
                </div>
              ) : hasCheckedForUpdates ? (
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <p className="text-muted-foreground text-center font-sans text-lg">
                    All addins are up to date!
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleCheckForUpdates}
                    className="mt-2"
                  >
                    Check Again
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-muted-foreground text-center font-sans">
                    No notifications at this time.
                  </p>
                  <CheckForUpdatesButton onClick={handleCheckForUpdates} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {addinUpdateNotifications.map((notification, index) => (
                <AddinUpdateNotificationCard
                  key={index}
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
