export interface KvSubscriptionModel<T>{
    /** The string that the Tauri emit event will be identified by */
    identifier: string,
    /** The data that is currently being stored in the KV storage, given that the key exists */
    lastData: T|undefined
}