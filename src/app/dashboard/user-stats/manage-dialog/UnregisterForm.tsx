import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useManageDialogStore } from "./store";
import { Button } from "@/components/ui/button";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import useUserStats from "@/lib/user-stats/useUserStats";

export default function UnregisterForm() {
  const { userName, userEmail, setUnregisteringUser, setIsVisible } =
    useManageDialogStore();
  const { unregisterUser } = getTauriCommands();
  const { refresh } = useUserStats();

  const onUnregister = async () => {
    await unregisterUser(userEmail);
    setUnregisteringUser(undefined);
    setIsVisible(false);
    // Refresh the user stats after 500ms
    setTimeout(refresh, 500);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <div className="flex flex-row gap-1">
            <p className="font-sans text-foreground">Unregister</p>
            <p className="font-sans text-destructive text">{userName}</p>
          </div>
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to unregister this user?
        </DialogDescription>
        <DialogDescription>
          This will remove all addins from this user and remove them from the
          database.
        </DialogDescription>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <Button variant="destructive" onClick={onUnregister}>
          Confirm Unregister
        </Button>
      </DialogHeader>
    </DialogContent>
  );
}
