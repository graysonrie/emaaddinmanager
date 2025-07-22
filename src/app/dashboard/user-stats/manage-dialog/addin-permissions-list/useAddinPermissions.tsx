import { useEffect, useState } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";

interface Props {
  userEmail: string;
}

export default function useAddinPermissions({ userEmail }: Props) {
  const [allowedAddinPaths, setAllowedAddinPaths] = useState<string[]>([]);
  const [hasUserRegistered, setHasUserRegistered] = useState(false);

  const fetchUser = async () => {
    const user = await getTauriCommands().getUser(userEmail);
    if (user) {
      setAllowedAddinPaths(user.allowedAddinPaths);
      setHasUserRegistered(true);
    } else {
      setHasUserRegistered(false);
      setAllowedAddinPaths([]);
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
    return allowedAddinPaths.includes(path);
  };

  return {
    allowedAddinPaths,
    hasUserRegistered,
    addAllowedAddinPath,
    removeAllowedAddinPath,
    isAllowedAddinPath,
  };
}
