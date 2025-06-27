import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";
import { AddinModel } from "@/lib/models/addin.model";

interface TauriCommands {
  kvStoreSet: (key: string, value: any) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
  getAddins: (path: string) => Promise<AddinModel[]>;
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

  const getAddins = useCallback(async (path: string) => {
    try {
      return await invoke<AddinModel[]>("get_addins", { path });
    } catch (err) {
      console.error("Failed to get addins:", err);
      return [];
    }
  }, []);

  return {
    kvStoreSet,
    kvStoreGet,
    kvStoreSubscribeToKey,
    getAddins,
  };
}
