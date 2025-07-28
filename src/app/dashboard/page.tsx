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
import AddinBadgesDisplay from "./components/addin-badges-display";
import { useAuthStore } from "@/lib/auth/useAuthStore";

export default function Home() {
  const { setIsOpen } = useSidebarStore();
  const { isInitialized, isComplete, config } = useConfigInitialization();
  const { user } = useUserPermissions();
  const { amIAnAdmin } = useAuthStore();
  const router = useRouter();
  const [description, setDescription] = useState(
    "The addins you have been given access to."
  );

  useEffect(() => {
    if (!isInitialized) return; // Don't make routing decisions until initialized

    if (!isComplete || !user) {
      if (!isComplete) {
        console.warn("Config is not complete, redirecting to setup");
      } else {
        console.warn("User is not set, redirecting to setup");
      }
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else {
      setIsOpen(true);
    }
  }, [isInitialized, isComplete, router, setIsOpen, user]);

  useEffect(() => {
    const checkAdmin = async () => {
      const selfAdminStatus = await amIAnAdmin();
      if (selfAdminStatus === "super" || selfAdminStatus === "admin") {
        setDescription("As an admin, you can view all available addins.");
      } else {
        setDescription("The addins you have been given access to.");
      }
    };
    checkAdmin();
  }, [amIAnAdmin, setDescription]);

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
      <div className="flex flex-col gap-4 max-w-screen-lg w-full h-full mx-auto thin-scrollbar items-center justify-center">
        <div className="flex flex-col gap-2 w-full h-full p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">Your Addins</h2>
            <p className="text-muted-foreground mb-4">{description}</p>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto thin-scrollbar">
            <AddinBadgesDisplay />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
