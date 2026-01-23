import { useEffect } from "react";
import { useKeyValueSubscription } from "./useKeyValueSubscription";
import { useUserPermissionsStore } from "./useUserPermissionsStore";
import { useKeyValueStore } from "./useKeyValueStore";

export default function useUserPermissions() {
  const userEmail = useKeyValueSubscription<string>("userEmail");
  const user = useUserPermissionsStore((state) => state.user);
  const isLoading = useUserPermissionsStore((state) => state.isLoading);
  const registerAndAddAllowedAddinPaths = useUserPermissionsStore(
    (state) => state.registerAndAddAllowedAddinPaths
  );
  const fetchUser = useUserPermissionsStore((state) => state.fetchUser);

  // Subscribe to userEmail changes and fetch user when it changes
  useEffect(() => {
    // Ensure the key-value store is subscribed to userEmail
    const keyValueStore = useKeyValueStore.getState();
    keyValueStore.subscribeToKey<string>("userEmail");

    // Fetch user when userEmail changes
    fetchUser(userEmail);

    return () => {
      // Cleanup is handled by useKeyValueSubscription
    };
  }, [userEmail, fetchUser]);

  return {
    user,
    isLoading,
    registerAndAddAllowedAddinPaths,
  };
}
