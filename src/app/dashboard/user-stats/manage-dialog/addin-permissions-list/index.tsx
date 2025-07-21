import { MessageCircleWarning } from "lucide-react";
import { useManageDialogStore } from "../store";

import useAddinPermissions from "./useAddinPermissions";
import { Button } from "@/components/ui/button";

export default function AddinPermissionsList() {
  const { userEmail } = useManageDialogStore();
  const { allowedAddinPaths, hasUserRegistered } = useAddinPermissions({
    userEmail,
  });

  const manageDialog = useManageDialogStore();

  return (
    <div className="flex flex-col gap-2">
      {hasUserRegistered ? (
        <>
          <p className="text-sm font-bold font-sans">Addin Permissions</p>
          <div className="flex flex-col gap-2">
            {allowedAddinPaths.map((path) => (
              <p key={path}>{path}</p>
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
