import { useEffect, useState } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinPermissionModel, DEFAULT_ADDIN_PERMISSIONS } from "./types";

interface Props {
  userEmail: string;
}

export default function useAddinPermissions({ userEmail }: Props) {
  const [allowedAddins, setAllowedAddins] = useState<AddinPermissionModel[]>([]);
  const [hasUserRegistered, setHasUserRegistered] = useState(false);

  const fetchUser = async () => {
    const user = await getTauriCommands().getUser(userEmail);
    if (user) {
      setAllowedAddins(user.allowedAddinPaths.map((path) => {
        const addin = DEFAULT_ADDIN_PERMISSIONS.find((addin) => addin.relativePathToAddin === path);
        if (!addin) {
          throw new Error("Addin not found");
        }
        return addin;
      }));
      setHasUserRegistered(true);
    } else {
      setHasUserRegistered(false);
      setAllowedAddins([]);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userEmail]);

  const addAllowedAddinPath = async (path: string) => {
    console.log("Adding addin path", path);
    await getTauriCommands().addAllowedAddinPaths(userEmail, [path]);
    await fetchUser();
  };

  const removeAllowedAddinPath = async (path: string) => {
    console.log("Removing addin path", path);
    await getTauriCommands().removeAllowedAddinPaths(userEmail, [path]);
    // Refresh the state after removing
    await fetchUser();
  };

  const isAllowedAddinPath = (path: string) => {
    return allowedAddins.some((addin) => addin.relativePathToAddin === path);
  };

  return {
    allowedAddins,
    hasUserRegistered,
    addAllowedAddinPath,
    removeAllowedAddinPath,
    isAllowedAddinPath,
  };
}
