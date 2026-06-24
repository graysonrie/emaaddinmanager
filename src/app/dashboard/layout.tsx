"use client";

import Sidebar from "@/app/dashboard/components/sidebar";
import { useSidebarStore } from "./components/sidebar/store";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import InstallingAddinsOverlay from "./components/installing-addins-overlay";
import useConfig from "@/lib/persistence/config/useConfig";
import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";
import { useHelpTicketNotifications } from "@/lib/help-tickets/useHelpTicketNotifications";
import { toast, Toaster } from "sonner";
import useUserStatsUpdater from "@/lib/user-stats/useUserStatsUpdater";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  useUserStatsUpdater();

  const config = useConfig();
  useAddinUpdater({
    onNewNotifications: (addinUpdateNotifications) => {
      addinUpdateNotifications.forEach((notification) => {
        const toastContent = notification.title;
        if (notification.notificationType == "install") {
          toast.success(toastContent);
        }
        if (notification.notificationType == "info") {
          toast.info(toastContent);
        }
        if (notification.notificationType == "warning") {
          toast.warning(toastContent);
        }
      });
    },
  });

  useHelpTicketNotifications({
    onNewNotifications: (helpTicketNotifications) => {
      helpTicketNotifications.forEach((notification) => {
        if (
          notification.updateType === "statusChanged" ||
          notification.updateType === "newTicket"
        ) {
          toast.info(notification.title, {
            description: notification.description,
          });
        } else {
          toast.success(notification.title, {
            description: notification.description,
          });
        }
      });
    },
  });

  // Test registry: C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry
  // Real registry: S:\\BasesRevitAddinsRegistry

  useEffect(() => {
    config.update("localAddinRegistryPath", "S:\\BasesRevitAddinsRegistry");
    console.log("Updating addin registry path in config");

    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        console.log("CTRL+F or CMD+F pressed");
      }
    };
    window.addEventListener("keydown", handler);

    router.prefetch("/dashboard/library");
    router.prefetch("/dashboard/installed");
    router.prefetch("/dashboard/settings");
    router.prefetch("/dashboard/notifications");
    router.prefetch("/dashboard/publish");

    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleContextMenu = (e: any) => {
    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      <motion.div
        initial={{ width: isOpen ? 64 : 0 }}
        animate={{ width: isOpen ? 64 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-shrink-0 overflow-hidden"
      >
        <Sidebar />
      </motion.div>
      <main className="flex-1 flex flex-col overflow-hidden rounded-tl-lg">
        {children}
      </main>
      <InstallingAddinsOverlay />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
