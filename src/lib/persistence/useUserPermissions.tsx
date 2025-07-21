import { useEffect, useState } from "react";

import { UserModel } from "../models/user.model";
import getTauriCommands from "../commands/getTauriCommands";
import { useKeyValueSubscription } from "./useKeyValueSubscription";
import { useConfigValue } from "./config/useConfigValue";
import { DEFAULT_ADDIN_PERMISSIONS } from "@/app/dashboard/user-stats/manage-dialog/types";

export default function useUserPermissions() {
  // If the user is undefined, it means that they do not exist
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const userEmail = useConfigValue("userEmail");

  const { registerUser, addAllowedAddinPaths } = getTauriCommands();

  const registerAndAddAllowedAddinPaths = async (discipline: string) => {
    if (!userEmail) {
      throw new Error("User email is not set");
    }
    const user = await registerUser(userEmail, discipline);
    const permissions = DEFAULT_ADDIN_PERMISSIONS;
    const permission = permissions.find(
      (permission) => permission.forDiscipline === discipline
    );
    if (!permission) {
      throw new Error("Permission not found");
    }
    await addAllowedAddinPaths(userEmail, [permission.relativePathToAddin]);
    return user;
  };

  useEffect(() => {
    if (userEmail) {
      getTauriCommands()
        .getUser(userEmail)
        .then((userData) => {
          setUser(userData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to get user:", error);
          setUser(undefined);
          setIsLoading(false);
        });
    } else {
      setUser(undefined);
      setIsLoading(false);
    }

    return () => {};
  }, [userEmail]);

  return {
    user,
    isLoading,
    registerAndAddAllowedAddinPaths,
  };
}
