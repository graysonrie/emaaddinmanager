import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";
import useTauriCommands from "../commands/getTauriCommands";

type KeyValueState = {
  values: Record<string, any>;
  subscribeToKey: <T>(key: string) => void;
  unsubscribeFromKey: (key: string) => void;
  set: (key: string, value: any) => void;
  get: <T>(key: string) => Promise<T | undefined>;
};

const subscriptions = new Map<
  string,
  { unlisten: () => void; count: number }
>();

export const useKeyValueStore = create<KeyValueState>((set, get) => ({
  values: {},
  subscribeToKey: async <T>(key: string) => {
    if (subscriptions.has(key)) {
      subscriptions.get(key)!.count++;
      return;
    }

    const { kvStoreSubscribeToKey } = useTauriCommands();
    const model = await kvStoreSubscribeToKey<T>(key);
    const eventName: string = model.identifier;
    const lastData: T | undefined = model.lastData;

    set((state) => ({
      values: { ...state.values, [key]: lastData },
    }));

    const unlisten = await listen<T>(eventName, (event) => {
      set((state) => ({
        values: { ...state.values, [key]: event.payload },
      }));
    });

    subscriptions.set(key, { unlisten, count: 1 });
  },
  unsubscribeFromKey: (key: string) => {
    const sub = subscriptions.get(key);
    if (!sub) return;
    sub.count--;
    if (sub.count <= 0) {
      sub.unlisten();
      subscriptions.delete(key);
    }
  },
  set: async (key: string, value: any) => {
    const { kvStoreSet } = useTauriCommands();
    await kvStoreSet(key, value);
  },
  get: async <T>(key: string): Promise<T | undefined> => {
    const { kvStoreGet } = useTauriCommands();
    return await kvStoreGet<T>(key);
  },
}));
