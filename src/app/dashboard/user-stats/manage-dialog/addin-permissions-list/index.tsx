import { MessageCircleWarning } from "lucide-react";
import { useManageDialogStore } from "../store";
import { useEffect, useState } from "react";

import useAddinPermissions from "../../../../../lib/addins/addin-management/useAddinPermissions";
import { Button } from "@/components/ui/button";
import AddinPermission from "./AddinPermission";
import getTauriCommands from "../../../../../lib/commands/getTauriCommands";

export default function AddinPermissionsList() {
  const {
    userEmail,
    setTempBlockedAddinPaths,
    tempBlockedAddinPaths,
    resetTempPermissions,
  } = useManageDialogStore();
  const { blockedAddinPaths, hasUserRegistered, allAvailableAddins } =
    useAddinPermissions({
      userEmail,
    });
  const [isSaving, setIsSaving] = useState(false);

  const manageDialog = useManageDialogStore();

  // Initialize store with userEmail and load data
  useEffect(() => {
    if (userEmail) {
      // The initialize function is no longer available from the hook,
      // so we'll rely on the hook's default behavior or manual re-fetching
      // if needed. For now, we'll just ensure the userEmail is set.
    }
  }, [userEmail]);

  // Load user's current blocked paths into temporary state on mount
  useEffect(() => {
    if (hasUserRegistered) {
      setTempBlockedAddinPaths(blockedAddinPaths);
    } else {
      resetTempPermissions();
    }
  }, [
    hasUserRegistered,
    blockedAddinPaths,
    setTempBlockedAddinPaths,
    resetTempPermissions,
  ]);

  const handleComplete = async () => {
    if (hasUserRegistered) {
      setIsSaving(true);
      try {
        await getTauriCommands().setBlockedAddinPathsForUser(
          userEmail,
          tempBlockedAddinPaths
        );
        manageDialog.setIsVisible(false);
      } catch (error) {
        console.error("Failed to save blocked addins:", error);
        // You might want to show an error message to the user here
      } finally {
        setIsSaving(false);
      }
    } else {
      manageDialog.setIsVisible(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {hasUserRegistered ? (
        <>
          <p className="text-sm font-bold font-sans">Blocked Addins</p>
          <div className="flex flex-col gap-2">
            {allAvailableAddins.map((permission) => (
              <AddinPermission
                key={permission.relativePathToAddin}
                permission={permission}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <MessageCircleWarning className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-sans">
            User has not registered yet. After they are registered, you can
            manage their addin permissions.
          </p>
        </div>
      )}
      <Button
        variant="default"
        className="w-full"
        onClick={handleComplete}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
