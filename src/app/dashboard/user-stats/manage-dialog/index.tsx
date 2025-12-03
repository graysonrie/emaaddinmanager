import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useManageDialogStore } from "./store";
import { User } from "lucide-react";
import AddinPermissionsList from "./addin-permissions-list";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import UnregisterForm from "./UnregisterForm";
import SetTempPasswordForm from "./SetTempPasswordForm";
import getTauriCommands from "@/lib/commands/getTauriCommands";

export default function ManageDialog() {
  const {
    isVisible,
    setIsVisible,
    userName,
    userEmail,
    setUnregisteringUser,
    unregisteringUser,
    settingTempPassword,
    setSettingTempPassword,
  } = useManageDialogStore();

  const [canModify, setCanModify] = useState(false);
  const [canUnregister, setCanUnregister] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const { isAdmin, amIAnAdmin } = useAuthStore();
  const { loginCheckIfPasswordIsSetForUser } = getTauriCommands();

  useEffect(() => {
    const checkAdmin = async () => {
      const selfAdminStatus = await amIAnAdmin();
      if (selfAdminStatus === "super") {
        setCanUnregister(true);
      }
      const userAdminStatus = await isAdmin(userEmail);
      if (userAdminStatus === "admin" || userAdminStatus === "super") {
        // First check if the viewing user is an admin
        setCanModify(false);
      } else {
        setCanModify(true);
      }
    };
    checkAdmin();
  }, [isAdmin, userEmail, amIAnAdmin]);

  useEffect(() => {
    const checkPassword = async () => {
      if (userEmail) {
        const hasPasswordSet = await loginCheckIfPasswordIsSetForUser(
          userEmail
        );
        setHasPassword(hasPasswordSet);
      }
    };
    checkPassword();
  }, [userEmail, loginCheckIfPasswordIsSetForUser]);

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      {unregisteringUser ? (
        <UnregisterForm />
      ) : settingTempPassword ? (
        <SetTempPasswordForm />
      ) : (
        <DialogContent className="max-h-[80vh] flex flex-col thin-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div className="flex flex-row gap-1">
                <p className="font-sans text-foreground">Manage</p>
                <p className="font-sans text-chart-2 text">{userName}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Manage the addins that this user has access to
            </DialogDescription>
            <DialogDescription>
              Toggling on an add-in will automatically install it for them when
              they open the app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {canModify ? (
                <>
                  <AddinPermissionsList />
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground font-semibold">
                    You cannot manage addin permissions for admins.
                  </p>
                </div>
              )}
            </div>
            {canUnregister && (
              <div className="flex flex-col gap-2 items-center">
                <span
                  className={`font-sans text-sm ${
                    hasPassword === false
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-blue-500 cursor-pointer hover:underline"
                  }`}
                  onClick={() => {
                    if (hasPassword !== false) {
                      setSettingTempPassword(userEmail);
                    }
                  }}
                  title={
                    hasPassword === false
                      ? "User has no password set. Cannot set temporary password."
                      : "Set temporary password for this user"
                  }
                >
                  Set Temporary Password
                </span>
                <span
                  className="text-destructive cursor-pointer hover:underline font-sans text-sm"
                  onClick={() => setUnregisteringUser(userEmail)}
                >
                  Unregister User
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
