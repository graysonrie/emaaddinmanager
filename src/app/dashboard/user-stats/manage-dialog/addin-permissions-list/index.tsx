import { MessageCircleWarning, X } from "lucide-react";
import { useManageDialogStore } from "../store";

import useAddinPermissions from "../../../../../lib/addins/addin-management/useAddinPermissions";
import { Button } from "@/components/ui/button";
import AddinPermission from "./AddinPermission";
import { DEFAULT_ADDIN_PERMISSIONS } from "../../../../../lib/addins/addin-management/types";

export default function AddinPermissionsList() {
  const { userEmail } = useManageDialogStore();
  const { allowedAddins, hasUserRegistered } = useAddinPermissions({
    userEmail,
  });
  const addinPermission = DEFAULT_ADDIN_PERMISSIONS;

  const manageDialog = useManageDialogStore();

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
        variant="outline"
        className="w-full"
        onClick={() => manageDialog.setIsVisible(false)}
      >
        Complete
      </Button>
    </div>
  );
}
