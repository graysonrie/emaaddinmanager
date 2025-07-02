import { useKeyValueSubscription } from "../useKeyValueSubscription";
import { ConfigKeys } from "./config-keys";
import { useEffect, useRef, useState } from "react";
import useConfig from "./useConfig";

/**
 * Hook to observe a specific config value
 * @param key The config key to observe
 * @returns Object with data, loading, and error states
 */
export function useConfigValue<K extends keyof ConfigKeys>(key: K) {
  return useKeyValueSubscription<ConfigKeys[K]>(key);
}

/**
 * Hook to observe a config value with a default fallback
 * This version does NOT automatically set the default in the database
 * @param key The config key to observe
 * @param defaultValue The default value to use if the key doesn't exist
 * @returns Object with data, loading, and error states
 */
export function useConfigValueWithFallback<K extends keyof ConfigKeys>(
  key: K,
  defaultValue: ConfigKeys[K]
) {
  const subscription = useKeyValueSubscription<ConfigKeys[K]>(key);

  return {
    data: subscription ?? defaultValue,
  };
}

/**
 * Hook to observe a config value with automatic default setting
 * This version will set the default in the database if the key doesn't exist
 * @param key The config key to observe
 * @param defaultValue The default value to use if the key doesn't exist
 * @returns Object with data, loading, and error states
 */
export function useConfigValueOrDefault<K extends keyof ConfigKeys>(
  key: K,
  defaultValue: ConfigKeys[K]
) {
  const { readOrSet } = useConfig();
  const [hasSetDefault, setHasSetDefault] = useState(false);
  const subscription = useKeyValueSubscription<ConfigKeys[K]>(key);

  // Only set default once when the component mounts and no value exists
  useEffect(() => {
    if (!hasSetDefault && subscription === undefined) {
      setHasSetDefault(true);
      readOrSet(key, defaultValue).catch(console.error);
    }
  }, [key, defaultValue, hasSetDefault, subscription, readOrSet]);

  return {
    data: subscription ?? defaultValue,
  };
}
