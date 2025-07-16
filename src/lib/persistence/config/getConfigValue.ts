import { ConfigKeys } from "./config-keys";
import getTauriCommands from "../../commands/getTauriCommands";

/**
 * Get a config value directly without React hooks
 * This can be used in Zustand stores or other non-React contexts
 * @param key The config key to get
 * @returns Promise that resolves to the config value or undefined if not found
 */
export async function getConfigValue<K extends keyof ConfigKeys>(
  key: K
): Promise<ConfigKeys[K] | undefined> {
  const { kvStoreGet } = getTauriCommands();
  return await kvStoreGet<ConfigKeys[K]>(key);
}

/**
 * Get a config value with a default fallback
 * This does NOT automatically set the default in the database
 * @param key The config key to get
 * @param defaultValue The default value to use if the key doesn't exist
 * @returns Promise that resolves to the config value or the default
 */
export async function getConfigValueWithFallback<K extends keyof ConfigKeys>(
  key: K,
  defaultValue: ConfigKeys[K]
): Promise<ConfigKeys[K]> {
  const value = await getConfigValue(key);
  return value ?? defaultValue;
}

/**
 * Get a config value with automatic default setting
 * This will set the default in the database if the key doesn't exist
 * @param key The config key to get
 * @param defaultValue The default value to use if the key doesn't exist
 * @returns Promise that resolves to the config value or the default
 */
export async function getConfigValueOrDefault<K extends keyof ConfigKeys>(
  key: K,
  defaultValue: ConfigKeys[K]
): Promise<ConfigKeys[K]> {
  const { kvStoreGet, kvStoreSet } = getTauriCommands();

  try {
    const value = await kvStoreGet<ConfigKeys[K]>(key);
    if (value !== undefined && value !== null) {
      return value;
    }
  } catch (error) {
    console.warn(`Failed to get config value for key: ${key}`, error);
  }

  // Set the default value in the database
  try {
    await kvStoreSet(key, defaultValue);
    console.log(`Set default config value for key: ${key}`, defaultValue);
  } catch (error) {
    console.error(`Failed to set default config value for key: ${key}`, error);
  }

  return defaultValue;
}
