import { useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/app/dashboard/components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import usePasswordCheck from "@/app/dashboard/setup/usePasswordCheck";
import { useSetupStore } from "@/app/dashboard/setup/store";
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
  const { isPasswordSetForSelf, isCheckingPasswordSet, isTempPassword } =
    usePasswordCheck();
  const { setForcePasswordChange } = useSetupStore();
  const router = useRouter();

  const [activeAddinOperations, setActiveAddinOperations] = useState<
    Record<string, boolean>
  >({});

  const isAddinOperationInProgress =
    Object.keys(activeAddinOperations).length > 0;

  const shouldWaitForPasswordCheck = isComplete;

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

    if (
      !isInitialized ||
      isUserLoading ||
      (shouldWaitForPasswordCheck && isCheckingPasswordSet) ||
      isAddinOperationInProgress
    )
      return; // Don't make routing decisions until core checks and addin operations are ready

    if (!isComplete || !user || isPasswordSetForSelf !== true) {
      if (!isComplete) {
        console.warn("Config is not complete, redirecting to setup");
      } else if (!user) {
        console.warn(
          "User is not set (after loading completed), redirecting to setup",
        );
      }
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else if (isTempPassword === true) {
      // User has temp password, force them to change it
      console.warn(
        "User has temporary password, redirecting to password change",
      );
      setForcePasswordChange(true);
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
    shouldWaitForPasswordCheck,
    isCheckingPasswordSet,
    isAddinOperationInProgress,
    isPasswordSetForSelf,
    isTempPassword,
    setForcePasswordChange,
  ]);

  if (isSetupPage) {
    return {
      loading: false,
      isComplete,
    };
  }

  // Show loading state while checking initialization or user
  if (
    !isInitialized ||
    isUserLoading ||
    (shouldWaitForPasswordCheck && isCheckingPasswordSet) ||
    isAddinOperationInProgress
  ) {
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
