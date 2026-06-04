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
import PongGame from "./components/pong-game";
import useAddinPermissions from "@/lib/addins/addin-management/useAddinPermissions";
import AboutAddinModal from "./components/about-addin-modal";
import usePasswordCheck from "./setup/usePasswordCheck";
import { useSetupStore } from "./setup/store";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface AddinInstallProgressEvent {
  progress: number;
  addinName: string;
  description: string;
}

export default function Home() {
  const { setIsOpen } = useSidebarStore();
  const { isInitialized, isComplete, config } = useConfigInitialization();
  const { user, isLoading: isUserLoading } = useUserPermissions();
  const { isLoading: isLoadingAddins, allowedAddins } = useAddinPermissions({
    userEmail: user?.userEmail ?? "",
  });
  const { isPasswordSetForSelf, isCheckingPasswordSet, isTempPassword } =
    usePasswordCheck();
  const { setForcePasswordChange } = useSetupStore();
  const { amIAnAdmin } = useAuthStore();
  const router = useRouter();
  const [description, setDescription] = useState(
    "The addins you have been given access to."
  );
  const [activeAddinOperations, setActiveAddinOperations] = useState<
    Record<string, boolean>
  >({});

  const isAddinOperationInProgress = Object.keys(activeAddinOperations).length > 0;

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<AddinInstallProgressEvent>(
          "addin_install_progress",
          (event) => {
            const { progress, addinName } = event.payload;

            setActiveAddinOperations((prev) => {
              const next = { ...prev };
              if (progress >= 100) {
                delete next[addinName];
              } else {
                next[addinName] = true;
              }
              return next;
            });
          }
        );
      } catch (error) {
        console.error("Failed to set up addin progress listener:", error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  useEffect(() => {
    if (
      !isInitialized ||
      isUserLoading ||
      isCheckingPasswordSet ||
      isAddinOperationInProgress
    )
      return; // Don't make routing decisions until core checks and addin operations are ready

    if (!isComplete || !user || isPasswordSetForSelf !== true) {
      if (!isComplete) {
        console.warn("Config is not complete, redirecting to setup");
      } else if (!user) {
        console.warn(
          "User is not set (after loading completed), redirecting to setup"
        );
      }
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else if (isTempPassword === true) {
      // User has temp password, force them to change it
      console.warn(
        "User has temporary password, redirecting to password change"
      );
      setForcePasswordChange(true);
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else {
      setIsOpen(true);
    }
  }, [
    isInitialized,
    isComplete,
    router,
    setIsOpen,
    user,
    isUserLoading,
    isCheckingPasswordSet,
    isAddinOperationInProgress,
    isPasswordSetForSelf,
    isTempPassword,
    setForcePasswordChange,
  ]);

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

  // Show loading state while checking initialization or user
  if (
    !isInitialized ||
    isUserLoading ||
    isCheckingPasswordSet ||
    isAddinOperationInProgress
  ) {
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
      <div className="flex flex-col font-sans gap-4 w-full h-full mx-auto thin-scrollbar items-center justify-center">
        <div className="flex flex-col gap-2 w-full h-full p-6">
          {isLoadingAddins ? (
            <div className="flex items-center justify-center h-full w-full flex-col gap-4">
              <div className="flex flex-col gap-2 items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin" />
                <h2 className="font-sans">Loading your addins...</h2>
              </div>
              <PongGame />
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">Your Addins</h2>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto thin-scrollbar">
                <AddinBadgesDisplay allowedAddins={allowedAddins} />
              </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
