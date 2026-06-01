import { useManageDialogStore } from "../store";
import { Switch } from "@/components/ui/switch";
import { AddinPermissionModel } from "../../../../../lib/addins/addin-management/types";
import { Blocks, Loader2, Lock, Unlock } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useState } from "react";

interface AddinPermissionProps {
  permission: AddinPermissionModel;
}

export default function AddinPermission({ permission }: AddinPermissionProps) {
  const addinPath = permission.relativePathToAddin;
  const addinName = permission.displayName;
  const {
    isTempBlockedAddinPath,
    toggleTempBlockedAddinPath,
    tempBlockedAddinPaths,
    setTempBlockedAddinPaths,
  } = useManageDialogStore();

  const isBlocked = isTempBlockedAddinPath(addinPath);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const handleToggle = () => {
    toggleTempBlockedAddinPath(addinPath);
  };

  const handleBlockForAll = async () => {
    setIsBulkUpdating(true);
    try {
      await getTauriCommands().blockAddinPathForAllUsers(addinPath);
      // Keep the dialog in sync so saving this user doesn't unblock it again.
      if (!tempBlockedAddinPaths.includes(addinPath)) {
        setTempBlockedAddinPaths([...tempBlockedAddinPaths, addinPath].sort());
      }
    } catch (error) {
      console.error("Failed to block addin for all users:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleUnblockForAll = async () => {
    setIsBulkUpdating(true);
    try {
      await getTauriCommands().unblockAddinPathForAllUsers(addinPath);
      setTempBlockedAddinPaths(
        tempBlockedAddinPaths.filter((path) => path !== addinPath)
      );
    } catch (error) {
      console.error("Failed to unblock addin for all users:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="flex items-center gap-2 justify-between w-full hover:border-destructive border p-1 rounded-md pl-2 pr-2 cursor-pointer"
          onClick={handleToggle}
        >
          <div className="flex flex-row gap-2 items-center">
            {isBulkUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Blocks className="w-4 h-4" />
            )}
            <p className="text-sm font-sans">{addinName}</p>
          </div>
          <Switch
            checked={isBlocked}
            onCheckedChange={handleToggle}
            className="pointer-events-none"
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleBlockForAll} disabled={isBulkUpdating}>
          <Lock className="w-4 h-4" />
          Block for all users
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={handleUnblockForAll}
          disabled={isBulkUpdating}
        >
          <Unlock className="w-4 h-4" />
          Unblock for all users
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
