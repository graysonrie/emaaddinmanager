import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { useManageDialogStore } from "./store";
import { Button } from "@/components/ui/button";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useState } from "react";
import { TEMP_PASSWORD } from "@/types/constants";

export default function SetTempPasswordForm() {
  const {
    userName,
    userEmail,
    setSettingTempPassword,
    isConfirmingTempPassword,
    setIsConfirmingTempPassword,
  } = useManageDialogStore();
  const { loginSetTempPasswordForUser } = getTauriCommands();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginSetTempPasswordForUser(userEmail);
      setIsConfirmingTempPassword(true);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set temporary password"
      );
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    setSettingTempPassword(undefined);
  };

  if (isConfirmingTempPassword) {
    // Success confirmation dialog
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span>Temporary Password Set</span>
          </DialogTitle>
          <DialogDescription>
            The temporary password has been successfully set for {userName}.
          </DialogDescription>
          <DialogDescription className="font-semibold text-foreground">
            Please inform the user that their new password is:{" "}
            <span className="font-mono text-primary">{TEMP_PASSWORD}</span>
          </DialogDescription>
          <DialogDescription className="text-destructive">
            The user will be prompted to change this password when they log in
            next.
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => {
                setSettingTempPassword(undefined);
                setIsConfirmingTempPassword(false);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    );
  }

  // Initial confirmation dialog
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Key className="w-4 h-4" />
          <div className="flex flex-row gap-1">
            <p className="font-sans text-foreground">
              Set Temporary Password for
            </p>
            <p className="font-sans text-chart-2">{userName}</p>
          </div>
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to set a temporary password for this user? This
          should only be done if the user has forgotten their password.
        </DialogDescription>
        <DialogDescription>
          This will reset their current password to the temporary password:{" "}
          <span className="font-mono font-semibold">{TEMP_PASSWORD}</span>
        </DialogDescription>
        <DialogDescription className="text-destructive">
          The user will need to be informed of this password to log in.
        </DialogDescription>
        {error && (
          <DialogDescription className="text-destructive font-semibold">
            {error}
          </DialogDescription>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Setting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
}
