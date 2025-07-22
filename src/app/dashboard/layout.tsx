"use client";

import Sidebar from "@/app/dashboard/components/sidebar";
import { PageTransition } from "@/components/PageTransition";
import { useSidebarStore } from "./components/sidebar/store";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useConfigValueOrDefault } from "@/lib/persistence/config/useConfigValue";
import UpdaterPopup from "./components/updater-popup";
import useConfig from "@/lib/persistence/config/useConfig";
import { useAddinUpdater } from "@/lib/addins/addin-updater/useAddinUpdater";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarStore();
  const router = useRouter();

  const config = useConfig();
  useAddinUpdater();

  useEffect(() => {
    config.update(
      "localAddinRegistryPath",
      "C:\\Users\\grieger.EMA\\Favorites\\TEST_BasesRevitAddinsRegistry"
    );

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


  return (
    <div className="flex h-full w-full overflow-hidden">
      <motion.div
        initial={{ width: isOpen ? 64 : 0 }}
        animate={{ width: isOpen ? 64 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-shrink-0 overflow-hidden"
      >
        <Sidebar />
      </motion.div>
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <UpdaterPopup />
    </div>
  );
}
