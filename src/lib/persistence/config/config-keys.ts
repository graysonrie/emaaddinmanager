/**
 * These items lazily exist in the local db's KV Store
 *
 * This interface should never be constructed
 */
export interface ConfigKeys{
  /** `true` if it is the user's first time opening the app */
  isFirstUse: boolean;
  userEmail: string;
}