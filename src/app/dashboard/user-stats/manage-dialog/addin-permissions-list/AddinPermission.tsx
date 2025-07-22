import useAddinPermissions from "./useAddinPermissions";
import { useManageDialogStore } from "../store";
import { Switch } from "@/components/ui/switch";
import { AddinPermissionModel } from "../types";
import { Blocks } from "lucide-react";

interface AddinPermissionProps {
  permission: AddinPermissionModel;
}

export default function AddinPermission({ permission }: AddinPermissionProps) {
  const userEmail = useManageDialogStore.getState().userEmail;
  const addinPath = permission.relativePathToAddin;
  const { isAllowedAddinPath, addAllowedAddinPath, removeAllowedAddinPath } =
    useAddinPermissions({ userEmail });

  const isAllowed = isAllowedAddinPath(addinPath);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await addAllowedAddinPath(addinPath);
    } else {
      await removeAllowedAddinPath(addinPath);
    }
  };

  return (
    <div
      className="flex items-center gap-2 justify-between w-full rainbow-border p-1 rounded-md pl-2 pr-2 cursor-pointer"
      onClick={() => handleToggle(!isAllowed)}
    >
      <div className="flex flex-row gap-2">
        <Blocks className="w-4 h-4" />
        <p className="text-sm font-sans">{addinPath}</p>
      </div>
      <Switch
        checked={isAllowed}
        // onCheckedChange={handleToggle}
      />
    </div>
  );
}
