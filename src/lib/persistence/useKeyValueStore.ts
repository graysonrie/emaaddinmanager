import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";
import getTauriCommands from "../commands/getTauriCommands";
import { ConfigKeys } from "./config/config-keys";

type KeyValueState = {
  values: Partial<ConfigKeys>;
  loadingStates: Partial<Record<keyof ConfigKeys, boolean>>;
  subscribeToKey: <K extends keyof ConfigKeys>(key: K) => Promise<void>;
  unsubscribeFromKey: (key: keyof ConfigKeys) => void;
  set: <K extends keyof ConfigKeys>(
    key: K,
    value: ConfigKeys[K],
  ) => Promise<void>;
  get: <K extends keyof ConfigKeys>(
    key: K,
  ) => Promise<ConfigKeys[K] | undefined>;
  setLoading: (key: keyof ConfigKeys, loading: boolean) => void;
};

const subscriptions = new Map<
  keyof ConfigKeys,
  { unlisten: () => void; count: number }
>();

export const useKeyValueStore = create<KeyValueState>((set) => ({
  values: {},
  loadingStates: {},
  setLoading: (key: keyof ConfigKeys, loading: boolean) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: loading },
    }));
  },
  subscribeToKey: async <K extends keyof ConfigKeys>(key: K) => {
    if (subscriptions.has(key)) {
      subscriptions.get(key)!.count++;
      return;
    }

    // Set loading to true when starting subscription
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: true },
    }));

    const { kvStoreSubscribeToKey } = getTauriCommands();
    const model = await kvStoreSubscribeToKey<ConfigKeys[K]>(key);
    const eventName: string = model.identifier;
    const lastData: ConfigKeys[K] | undefined = model.lastData;

    set((state) => ({
      values: { ...state.values, [key]: lastData },
      loadingStates: { ...state.loadingStates, [key]: false },
    }));

    const unlisten = await listen<ConfigKeys[K]>(eventName, (event) => {
      set((state) => ({
        values: { ...state.values, [key]: event.payload },
      }));
    });

    subscriptions.set(key, { unlisten, count: 1 });
  },
  unsubscribeFromKey: (key: keyof ConfigKeys) => {
    const sub = subscriptions.get(key);
    if (!sub) return;
    sub.count--;
    if (sub.count <= 0) {
      sub.unlisten();
      subscriptions.delete(key);
    }
  },
  set: async <K extends keyof ConfigKeys>(key: K, value: ConfigKeys[K]) => {
    const { kvStoreSet } = getTauriCommands();
    await kvStoreSet(key, value);
  },
  get: async <K extends keyof ConfigKeys>(key: K) => {
    const { kvStoreGet } = getTauriCommands();
    return await kvStoreGet<ConfigKeys[K]>(key);
  },
}));
