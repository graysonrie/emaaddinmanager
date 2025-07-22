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

export default function ManageDialog() {
  const { isVisible, setIsVisible, userName } = useManageDialogStore();

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent>
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
            Toggling on an add-in will automatically install it for them.
            Toggling off an add-in will cause it to get uninstalled the next
            time the user opens this app.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <AddinPermissionsList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
