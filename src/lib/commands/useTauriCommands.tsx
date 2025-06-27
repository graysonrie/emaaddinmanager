import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";
import { AddinModel } from "@/lib/models/addin.model";
import { InstallAddinRequestModel } from "../models/install-addin-request.model";

interface TauriCommands {
  kvStoreSet: (key: string, value: any) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
  getAddins: (path: string) => Promise<AddinModel[]>;
  getLocalAddins: () => Promise<AddinModel[]>;
  getRevitVersions: () => Promise<string[]>;
  installAddin: (installRequest: InstallAddinRequestModel) => Promise<void>;
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

  const getLocalAddins = useCallback(async () => {
    try {
      return await invoke<AddinModel[]>("get_local_addins");
    } catch (err) {
      console.error("Failed to get local addins:", err);
      throw err;
    }
  }, []);

  const getRevitVersions = useCallback(async () => {
    try {
      return await invoke<string[]>("get_revit_versions");
    } catch (err) {
      console.error("Failed to get Revit versions:", err);
      throw err;
    }
  }, []);

  const installAddin = useCallback(async (installRequest: InstallAddinRequestModel) => {
    try {
      return await invoke<void>("install_addin", { installRequest });
    } catch (err) {
      console.error("Failed to install addin:", err);
      throw err;
    }
  }, []);

  return {
    kvStoreSet,
    kvStoreGet,
    kvStoreSubscribeToKey,
    getAddins,
    getLocalAddins,
    getRevitVersions,
    installAddin,
  };
}
