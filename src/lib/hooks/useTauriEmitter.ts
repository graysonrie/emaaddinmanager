import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

export function useTauriEmitter<PayloadType>(
  name: string,
  onEvent: (data: PayloadType) => void,
  onCleanup?: () => void,
  dependencies: [] = []
) {
  const unlistenRef = useRef<UnlistenFn | null>(null);

  useEffect(() => {
    if (unlistenRef.current) {
      // Already set up and listening
      return;
    }

    const unlisten = listen<PayloadType>(name, (event) => {
      onEvent(event.payload);
    });

    // Store the unlisten function when it's ready
    unlisten.then((fn) => {
      unlistenRef.current = fn;
    });

    return () => {
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }

      if (onCleanup) {
        onCleanup();
      }
    };
  }, dependencies);
}
