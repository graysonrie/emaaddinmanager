import { useEffect, useState } from "react";
import { UserResponseModel } from "../responses/user-response.model";
import getServerCommands from "../../getServerCommands";

export default function useUserProfile() {
  const [user, setUser] = useState<UserResponseModel | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { getSelf } = getServerCommands();

  useEffect(() => {
    getSelf().then((userData) => {
      setUser(userData);
      setIsLoading(false);
    });
  }, []);

  return {
    user,
    isLoading,
  };
}
