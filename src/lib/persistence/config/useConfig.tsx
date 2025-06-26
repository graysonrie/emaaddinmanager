import { useCallback } from "react";
import useKeyValueStore, { useKeyValueSubscription } from "../useKeyValueStore";
import { ConfigKeys } from "./config-keys";

export default function useConfig() {
  const { set, get } = useKeyValueStore();

  /** Subscribe to changes for one certain field in the config */
  const observeKey = useCallback(<K extends keyof ConfigKeys>(key: K) => {
    return useKeyValueSubscription<ConfigKeys[K]>(key);
  }, []);

  /** Update a specific key in the config */
  const update = useCallback(
    async <K extends keyof ConfigKeys>(
      key: K,
      value: ConfigKeys[K]
    ): Promise<void> => {
      // TODO: debounce the save operation if needed
      await set(key, value);
    },
    [set]
  );

  /** Read a specific key from the config */
  const read = useCallback(
    async <K extends keyof ConfigKeys>(
      key: K
    ): Promise<ConfigKeys[K] | undefined> => {
      const value = await get<ConfigKeys[K]>(key);
      return value;
    },
    [get]
  );

  /** Attempts to read an item from the config.
   *
   * If the value hasn't been set in the config, the fallback will be returned and
   * it will be added to the config.
   */
  const readOrSet = useCallback(
    async <K extends keyof ConfigKeys>(
      key: K,
      fallback: ConfigKeys[K]
    ): Promise<ConfigKeys[K]> => {
      const value = await read(key);
      if (value != undefined && value != null) {
        return value;
      } else {
        console.warn(`ConfigService - readOrSet notice:
      The provided key was not present in the database:${key}
      Assigning the fallback value`);
        await update(key, fallback);
        return fallback;
      }
    },
    [read, update]
  );

  return {
    observeKey,
    update,
    read,
    readOrSet,
  };
}
