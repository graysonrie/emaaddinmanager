"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "./components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import StatsDisplay from "./components/stats-display";
import ProfileSection from "../shared/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { setIsOpen } = useSidebarStore();
  const { isInitialized, isComplete, config } = useConfigInitialization();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // Don't make routing decisions until initialized

    if (!isComplete) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 p-4 h-full overflow-auto thin-scrollbar"
    >
      <div className="flex flex-col gap-4 max-w-screen-md w-full mx-auto">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">Home</p>
          <p className="text-sm text-muted-foreground">
            Welcome back, {config.userName?.split(" ")[0]}.
          </p>
        </div>
        <Separator className="w-full" />

        <StatsDisplay />
      </div>
    </motion.div>
  );
}
