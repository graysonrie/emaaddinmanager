import { useState, useEffect } from "react";
import { useKeyValueSubscription } from "./useKeyValueSubscription";

interface ConfigState {
  userEmail: string | undefined;
  userName: string | undefined;
  userDisciplines: string[] | undefined;
}

interface UseConfigInitializationReturn {
  isInitialized: boolean;
  isComplete: boolean;
  config: ConfigState;
}

export function useConfigInitialization(): UseConfigInitializationReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);

  const userEmail = useKeyValueSubscription<string>("userEmail");
  const userName = useKeyValueSubscription<string>("userName");
  const userDisciplines = useKeyValueSubscription<string[]>("userDisciplines");

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
    setIsInitialized(true);
  }, [userEmail, userName, userDisciplines, hasCheckedOnce]);

  const isComplete = Boolean(userEmail && userName && userDisciplines);

  return {
    isInitialized,
    isComplete,
    config: {
      userEmail,
      userName,
      userDisciplines,
    },
  };
}
