import { useKeyValueSubscription } from "../useKeyValueStore";
import { ConfigKeys } from "./config-keys";

/**
 * Hook to observe a specific config value
 * @param key The config key to observe
 * @returns Object with data, loading, and error states
 */
export function useConfigValue<K extends keyof ConfigKeys>(key: K) {
  return useKeyValueSubscription<ConfigKeys[K]>(key);
}
