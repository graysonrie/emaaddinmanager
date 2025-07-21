import { useEffect, useState } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";

interface Props {
  userEmail: string;
}

export default function useAddinPermissions({ userEmail }: Props) {
  const [allowedAddinPaths, setAllowedAddinPaths] = useState<string[]>([]);
  const [allowedAddinIds, setAllowedAddinIds] = useState<string[]>([]);
  const [hasUserRegistered, setHasUserRegistered] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getTauriCommands().getUser(userEmail);
      if (user) {
        setAllowedAddinPaths(user.allowedAddinPaths);
        setAllowedAddinIds(user.allowedAddinIds);
        setHasUserRegistered(true);
      } else {
        setHasUserRegistered(false);
        setAllowedAddinPaths([]);
        setAllowedAddinIds([]);
      }
    };
    fetchUser();
  }, []);

  return {
    allowedAddinPaths,
    hasUserRegistered,
  };
}
