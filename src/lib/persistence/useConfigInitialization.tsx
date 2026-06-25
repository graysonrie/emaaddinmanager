import { useState, useEffect } from "react";
import { useKeyValueSubscription } from "./useKeyValueSubscription";

let hasInitializedConfigGlobally = false;

interface ConfigState {
  userEmail: string | undefined;
  userName: string | undefined;
}

interface UseConfigInitializationReturn {
  isInitialized: boolean;
  isComplete: boolean;
  config: ConfigState;
}

export function useConfigInitialization(): UseConfigInitializationReturn {
  const [isInitialized, setIsInitialized] = useState(hasInitializedConfigGlobally);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(
    hasInitializedConfigGlobally,
  );

  const userEmail = useKeyValueSubscription("userEmail");
  const userName = useKeyValueSubscription("userName");

  useEffect(() => {
    if (hasCheckedOnce) return;

    // Wait a bit to ensure subscriptions have had time to initialize
    const timer = setTimeout(() => {
      setHasCheckedOnce(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasCheckedOnce) return;

    // Mark as initialized once we've received any response (even undefined)
    hasInitializedConfigGlobally = true;
    setIsInitialized(true);
  }, [userEmail, userName, hasCheckedOnce]);

  const isComplete = Boolean(userEmail && userName);

  return {
    isInitialized,
    isComplete,
    config: {
      userEmail,
      userName,
    },
  };
}
