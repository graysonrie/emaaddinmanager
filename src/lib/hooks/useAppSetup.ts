import { useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/app/dashboard/components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface AddinInstallProgressEvent {
  progress: number;
  addinName: string;
  description: string;
}

export function useAppSetup() {
  const pathname = usePathname();
  const isSetupPage = pathname === "/dashboard/setup";
  const { setIsOpen } = useSidebarStore();
  const { isInitialized, isComplete } = useConfigInitialization();
  const { user, isLoading: isUserLoading } = useUserPermissions();
  const router = useRouter();

  const [activeAddinOperations, setActiveAddinOperations] = useState<
    Record<string, boolean>
  >({});

  const isAddinOperationInProgress =
    Object.keys(activeAddinOperations).length > 0;

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
          },
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
    if (isSetupPage) return;

    if (!isInitialized || isUserLoading || isAddinOperationInProgress) return;

    if (!isComplete || !user) {
      if (!isComplete) {
        console.warn("Config is not complete, redirecting to setup");
      } else if (!user) {
        console.warn(
          "User is not set (after loading completed), redirecting to setup",
        );
      }
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else {
      setIsOpen(true);
    }
  }, [
    isSetupPage,
    isInitialized,
    isComplete,
    router,
    setIsOpen,
    user,
    isUserLoading,
    isAddinOperationInProgress,
  ]);

  if (isSetupPage) {
    return {
      loading: false,
      isComplete,
    };
  }

  // Show loading state while checking initialization or user
  if (!isInitialized || isUserLoading) {
    return {
      loading: true,
      isComplete,
    };
  }

  return {
    loading: false,
    isComplete,
  };
}
