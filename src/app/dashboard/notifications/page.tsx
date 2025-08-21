"use client";

import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";
import AddinUpdateNotificationCard from "./AddinUpdateNotificationCard";
import PageWrapper from "@/components/PageWrapper";
import { CheckForUpdatesButton } from "./CheckForUpdatesButton";
import { RevitStatusIndicator } from "./RevitStatusIndicator";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { Info } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";

// Separate component that uses useSearchParams
function NotificationsContent() {
  const { updateNotifications, clearUpdateNotifications } = useAddinUpdater();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoCheck = searchParams.get("autoCheck");

  // Auto-trigger updates check when navigating from AboutAddinModal
  useEffect(() => {
    if (autoCheck === "true") {
      const triggerAutoCheck = async () => {
        try {
          console.log("Auto-triggering updates check from AboutAddinModal");
          await getTauriCommands().checkForUpdatesManual();

          // Clean up the URL by removing the query parameter
          // router.replace("dashboard/notifications");
        } catch (error) {
          console.warn("Failed to auto-trigger updates check:", error);
          // Still clean up the URL even if the check fails
          // router.replace("dashboard/notifications");
        }
      };

      triggerAutoCheck();
    }
  }, [autoCheck, router]);

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
                  onClick={clearUpdateNotifications}
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
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No updates available
                </h3>
                <p className="text-muted-foreground">
                  All addins are up to date
                </p>
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
                      clearUpdateNotifications();
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

// Main page component with Suspense boundary
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
