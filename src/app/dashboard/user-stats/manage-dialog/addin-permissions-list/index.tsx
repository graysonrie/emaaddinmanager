import { MessageCircleWarning } from "lucide-react";
import { useManageDialogStore } from "../store";
import { useEffect, useState } from "react";

import useAddinPermissions from "../../../../../lib/addins/addin-management/useAddinPermissions";
import { Button } from "@/components/ui/button";
import AddinPermission from "./AddinPermission";
import { GLOBAL_DEFAULT_ADDIN_PERMISSIONS } from "../../../../../lib/addins/addin-management/types";
import getTauriCommands from "../../../../../lib/commands/getTauriCommands";

export default function AddinPermissionsList() {
  const {
    userEmail,
    setTempAllowedAddinPaths,
    tempAllowedAddinPaths,
    resetTempPermissions,
  } = useManageDialogStore();
  const { allowedAddins, hasUserRegistered } = useAddinPermissions({
    userEmail,
  });
  const addinPermission = GLOBAL_DEFAULT_ADDIN_PERMISSIONS;
  const [isSaving, setIsSaving] = useState(false);

  const manageDialog = useManageDialogStore();

  // Load user's current permissions into temporary state on mount
  useEffect(() => {
    if (hasUserRegistered && allowedAddins.length > 0) {
      const currentPaths = allowedAddins.map(
        (addin) => addin.relativePathToAddin
      );
      setTempAllowedAddinPaths(currentPaths);
    } else if (hasUserRegistered) {
      // User is registered but has no permissions yet
      setTempAllowedAddinPaths([]);
    } else {
      resetTempPermissions();
    }
  }, [
    hasUserRegistered,
    allowedAddins,
    setTempAllowedAddinPaths,
    resetTempPermissions,
  ]);

  const handleComplete = async () => {
    if (hasUserRegistered) {
      setIsSaving(true);
      try {
        await getTauriCommands().setAllowedAddinPathsForUser(
          userEmail,
          tempAllowedAddinPaths
        );
        manageDialog.setIsVisible(false);
      } catch (error) {
        console.error("Failed to save addin permissions:", error);
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
          <p className="text-sm font-bold font-sans">Allowed Addins</p>
          <div className="flex flex-col gap-2">
            {addinPermission.map((permission) => (
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
