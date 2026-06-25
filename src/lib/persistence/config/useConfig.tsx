import { useCallback } from "react";
import { ConfigKeys } from "./config-keys";
import { useKeyValueStore } from "../useKeyValueStore";

export default function useConfig() {
  const { set, get } = useKeyValueStore();



  /** Update a specific key in the config */
  const update = useCallback(
    async <K extends keyof ConfigKeys>(
      key: K,
      value: ConfigKeys[K]
    ): Promise<void> => {
      // TODO: debounce the save operation if needed
      await set(key, value as ConfigKeys[K]);
    },
    [set]
  );

  /** Read a specific key from the config */
  const read = useCallback(
    async <K extends keyof ConfigKeys>(
      key: K
    ): Promise<ConfigKeys[K] | undefined> => {
      const value = await get(key);
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
    update,
    read,
    readOrSet,
  };
}
