import { useEffect, useState } from "react";

import { UserModel } from "../models/user.model";
import getTauriCommands from "../commands/getTauriCommands";
import { useKeyValueSubscription } from "./useKeyValueSubscription";

export default function useUserPermissions() {
  // If the user is undefined, it means that they do not exist
  const [user, setUser] = useState<UserModel | undefined | null>(null);
  const userEmail = useKeyValueSubscription<string>("userEmail");

  const { registerUser, addAllowedAddinPaths } = getTauriCommands();

  useEffect(() => {
    if (userEmail) {
      getTauriCommands().getUser(userEmail).then(setUser);
    } else {
      setUser(undefined);
    }
  }, [userEmail]);

  return {
    user,
    registerUser,
    addAllowedAddinPaths,
  };
}
