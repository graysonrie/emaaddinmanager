import { useManageDialogStore } from "../store";
import { Switch } from "@/components/ui/switch";
import { AddinPermissionModel } from "../../../../../lib/addins/addin-management/types";
import { Blocks } from "lucide-react";

interface AddinPermissionProps {
  permission: AddinPermissionModel;
}

export default function AddinPermission({ permission }: AddinPermissionProps) {
  const addinPath = permission.relativePathToAddin;
  const addinName = permission.displayName;
  const { isTempBlockedAddinPath, toggleTempBlockedAddinPath } =
    useManageDialogStore();

  const isBlocked = isTempBlockedAddinPath(addinPath);

  const handleToggle = () => {
    toggleTempBlockedAddinPath(addinPath);
  };

  return (
    <div
      className="flex items-center gap-2 justify-between w-full hover:border-destructive border p-1 rounded-md pl-2 pr-2 cursor-pointer"
      onClick={handleToggle}
    >
      <div className="flex flex-row gap-2">
        <Blocks className="w-4 h-4" />
        <p className="text-sm font-sans">{addinName}</p>
      </div>
      <Switch checked={isBlocked} onCheckedChange={handleToggle} className="pointer-events-none"/>
    </div>
  );
}
