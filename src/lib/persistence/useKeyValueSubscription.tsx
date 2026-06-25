import { useEffect } from "react";
import { useKeyValueStore } from "./useKeyValueStore";
import { ConfigKeys } from "./config/config-keys";

export function useKeyValueSubscription<K extends keyof ConfigKeys>(
  key: K,
): ConfigKeys[K] | undefined {
  const value = useKeyValueStore((state) => state.values[key]);
  const subscribeToKey = useKeyValueStore((state) => state.subscribeToKey);
  const unsubscribeFromKey = useKeyValueStore(
    (state) => state.unsubscribeFromKey
  );

  useEffect(() => {
    subscribeToKey(key);
    return () => {
      unsubscribeFromKey(key);
    };
  }, [key, subscribeToKey, unsubscribeFromKey]);

  return value;
}

export function useKeyValueSubscriptionWithLoading<K extends keyof ConfigKeys>(
  key: K,
) {
  const value = useKeyValueSubscription(key);
  const loading = useKeyValueStore(
    (state) => state.loadingStates[key] ?? false
  );
  return { value, loading };
}
