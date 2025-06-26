import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import useTauriCommands from "../commands/useTauriCommands";

// Hook for subscribing to key-value store changes
export function useKeyValueSubscription<T>(key: string) {
  const { kvStoreSubscribeToKey } = useTauriCommands();
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const model = await kvStoreSubscribeToKey<T>(key);
        const eventName: string = model.identifier;
        const lastData: T | undefined = model.lastData;

        console.log(`Subscription model for key ${key}:`,model);

        if (lastData) {
          setData(lastData);
        }

        // Validate event name before setting up listener
        if (!eventName || typeof eventName !== "string") {
          throw new Error(
            `Invalid event identifier for key ${key}: ${eventName}`
          );
        }

        // Listen for updates using the event name from the subscription
        unlisten = await listen<T>(eventName, (event) => {
          console.log(`Received update for key ${key}:`, event.payload);
          setData(event.payload);
        });

        console.log(
          `Subscribed to key-value updates for key: ${key}, event: ${eventName}`
        );
      } catch (err) {
        console.error(`Failed to subscribe to key ${key}:`, err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    setupSubscription();

    // Cleanup listener when component unmounts or key changes
    return () => {
      if (unlisten) {
        console.log(`Unsubscribing from key: ${key}`);
        unlisten();
      }
    };
  }, [key, kvStoreSubscribeToKey]);

  return { data, loading, error };
}

// Main hook for key-value store operations
export default function useKeyValueStore() {
  const { kvStoreGet, kvStoreSet } = useTauriCommands();

  const set = useCallback(
    async (key: string, value: any) => {
      await kvStoreSet(key, value);
    },
    [kvStoreSet]
  );

  const get = useCallback(
    async <T,>(key: string): Promise<T | undefined> => {
      return await kvStoreGet<T>(key);
    },
    [kvStoreGet]
  );

  return {
    set,
    get,
  };
}
