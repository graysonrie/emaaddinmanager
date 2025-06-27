import { useState, useEffect, useCallback, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import useTauriCommands from "../commands/useTauriCommands";

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

// Hook for subscribing to key-value store changes
export function useKeyValueSubscription<T>(key: string) {
  const { kvStoreSubscribeToKey } = useTauriCommands();
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const listenerRef = useRef<((data: T) => void) | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isSubscribed = true;

    const setupSubscription = async () => {
      try {
        // Check if we already have a subscription for this key
        const existingSubscription = subscriptionCache.get(key);

        if (existingSubscription) {
          console.log(`Using existing subscription for key: ${key}`);
          setData(existingSubscription.data);
          setLoading(existingSubscription.loading);
          setError(existingSubscription.error);

          // Add our listener to the existing subscription
          const listener = (newData: T) => {
            if (isSubscribed) {
              setData(newData);
            }
          };
          existingSubscription.listeners.add(listener);
          listenerRef.current = listener;

          return;
        }

        setLoading(true);
        setError(null);

        const model = await kvStoreSubscribeToKey<T>(key);
        const eventName: string = model.identifier;
        const lastData: T | undefined = model.lastData;

        console.log(`Subscription model for key ${key}:`, model);

        if (lastData) {
          setData(lastData);
        }

        // Validate event name before setting up listener
        if (!eventName || typeof eventName !== "string") {
          throw new Error(
            `Invalid event identifier for key ${key}: ${eventName}`
          );
        }

        // Create listener function
        const listener = (newData: T) => {
          if (isSubscribed) {
            setData(newData);
            // Update cache
            const cached = subscriptionCache.get(key);
            if (cached) {
              cached.data = newData;
              // Notify all listeners
              cached.listeners.forEach((l) => l(newData));
            }
          }
        };

        // Listen for updates using the event name from the subscription
        unlisten = await listen<T>(eventName, (event) => {
          console.log(`Received update for key ${key}:`, event.payload);
          listener(event.payload);
        });

        // Cache the subscription
        subscriptionCache.set(key, {
          data: lastData,
          loading: false,
          error: null,
          listeners: new Set([listener]),
        });

        listenerRef.current = listener;

        console.log(
          `Subscribed to key-value updates for key: ${key}, event: ${eventName}`
        );
      } catch (err) {
        console.error(`Failed to subscribe to key ${key}:`, err);
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // Cache the error state
        subscriptionCache.set(key, {
          data: undefined,
          loading: false,
          error,
          listeners: new Set(),
        });
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    setupSubscription();

    // Cleanup listener when component unmounts or key changes
    return () => {
      isSubscribed = false;

      // Remove our listener from the cache
      const cached = subscriptionCache.get(key);
      if (cached && listenerRef.current) {
        cached.listeners.delete(listenerRef.current);

        // If no more listeners, clean up the subscription
        if (cached.listeners.size === 0) {
          subscriptionCache.delete(key);
          if (unlisten) {
            console.log(`Unsubscribing from key: ${key}`);
            unlisten();
          }
        }
      } else if (unlisten) {
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
