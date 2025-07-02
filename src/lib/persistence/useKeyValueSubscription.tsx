import { useState, useEffect, useCallback, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import useTauriCommands from "../commands/getTauriCommands";
import { useKeyValueStore } from "./useKeyValueStore";

// Global subscription cache to prevent duplicates
const subscriptionCache = new Map<
  string,
  {
    data: any;
    loading: boolean;
    error: Error | null;
    listeners: Set<(data: any) => void>;
  }
>();

export function useKeyValueSubscription<T>(key: string) {
  const value = useKeyValueStore((state) => state.values[key]);
  const subscribeToKey = useKeyValueStore((state) => state.subscribeToKey);
  const unsubscribeFromKey = useKeyValueStore(
    (state) => state.unsubscribeFromKey
  );

  useEffect(() => {
    subscribeToKey<T>(key);
    return () => {
      unsubscribeFromKey(key);
    };
  }, [key, subscribeToKey, unsubscribeFromKey]);

  return value as T | undefined;
}
