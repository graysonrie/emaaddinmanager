import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";

interface TauriCommands {
  kvStoreSet: (key: string, value: any) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
}

export default function useTauriCommands(): TauriCommands {
  const kvStoreSet = useCallback(async (key: string, value: any) => {
    await invoke<void>("kv_store_set", {
      key,
      value,
    });
    console.log(`KV Store - Set key: ${key} value:`, value);
  }, []);

  const kvStoreGet = useCallback(
    async <T,>(key: string): Promise<T | undefined> => {
      try {
        const data = await invoke<T>("kv_store_get", { key });
        return data;
      } catch (err) {
        console.log(err);
      }
      return undefined;
    },
    []
  );

  const kvStoreSubscribeToKey = useCallback(
    async <T,>(key: string): Promise<KvSubscriptionModel<T>> => {
      return await invoke<KvSubscriptionModel<T>>("kv_store_subscribe_to_key", {
        key,
      });
    },
    []
  );

  return {
    kvStoreSet,
    kvStoreGet,
    kvStoreSubscribeToKey,
  };
}
