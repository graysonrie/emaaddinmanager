import { useEffect, useState } from "react";
import getServerCommands, { UserResponse } from "../../getServerCommands";

export default function useUserProfile() {
  const [user, setUser] = useState<UserResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { getCurrentUser } = getServerCommands();

  useEffect(() => {
    getCurrentUser().then((userData) => {
      setUser(userData);
      setIsLoading(false);
    });
  }, []);

  return {
    user,
    isLoading,
  };
}
