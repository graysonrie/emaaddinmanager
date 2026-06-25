import type { KvStoreKeys } from "../kv-store-keys";

type ConfigKey =
  | "isFirstUse"
  | "userEmail"
  | "userName"
  | "userDisciplines"
  | "localAddinRegistryPath";

/**
 * User-facing config keys stored in the local DB KV store.
 *
 * This type should never be constructed directly.
 */
export type ConfigKeys = {
  [K in ConfigKey]: KvStoreKeys[K];
};
