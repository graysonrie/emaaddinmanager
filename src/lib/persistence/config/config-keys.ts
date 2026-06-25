/**
 * User-facing config keys stored in the local DB KV store.
 *
 * This type should never be constructed directly.
 */
export type ConfigKeys = {
  [K in keyof KvStoreKeys]: KvStoreKeys[K];
};

interface KvStoreKeys {
  isFirstUse: boolean;
  userEmail: string;
  userName: string;
  userDisciplines: string[];
  localAddinRegistryPath: string;
  statsKey: string;
}
