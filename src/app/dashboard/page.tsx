"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "./components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import StatsDisplay from "./user-stats/stats-display";
import ProfileSection from "../shared/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import UpdaterPopup from "./components/updater-popup";
import PageWrapper from "@/components/PageWrapper";
import Link from "next/link";
import useUserPermissions from "@/lib/persistence/useUserPermissions";

export default function Home() {
  const { setIsOpen } = useSidebarStore();
  const { isInitialized, isComplete, config } = useConfigInitialization();
  const { user } = useUserPermissions();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // Don't make routing decisions until initialized

    if (!isComplete || !user) {
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else {
      setIsOpen(true);
    }
  }, [isInitialized, isComplete, router, setIsOpen]);

  // Show loading state while checking initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render main content if setup is incomplete
  if (!isComplete) {
    return null;
  }

  // Show main app content
  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar items-center justify-center">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">
            Welcome back, {config.userName?.split(" ")[0]}.
          </p>
          <p className="text-md text-muted-foreground">
            Check out the <Link href="/dashboard/library" className="text-primary font-bold underline">addin library</Link> to get started.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
