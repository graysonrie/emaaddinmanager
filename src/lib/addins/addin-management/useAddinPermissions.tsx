import { useEffect, useState } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinPermissionModel, DEFAULT_ADDIN_PERMISSIONS } from "./types";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface Props {
  userEmail: string;
}

export default function useAddinPermissions({ userEmail }: Props) {
  const [allowedAddins, setAllowedAddins] = useState<AddinPermissionModel[]>(
    []
  );
  const [hasUserRegistered, setHasUserRegistered] = useState(false);
  const { isAdmin } = useAuthStore();

  const fetchUser = async () => {
    const user = await getTauriCommands().getUser(userEmail);
    if (user) {
      const isAdminUser = await isAdmin(userEmail);
      if (isAdminUser === "admin" || isAdminUser === "super") {
        // If the user is an admin, show all addins
        setAllowedAddins(DEFAULT_ADDIN_PERMISSIONS);
      } else {
        setAllowedAddins(
          user.allowedAddinPaths
            .map((path) => {
              const addin = DEFAULT_ADDIN_PERMISSIONS.find(
                (addin) => addin.relativePathToAddin === path
              );
              if (!addin) {
                return undefined;
              }
              return addin;
            })
            .filter((addin) => addin !== undefined)
        );
      }

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
