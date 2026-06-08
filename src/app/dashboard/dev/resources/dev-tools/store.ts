import { create } from "zustand";
import getTauriCommands from "@/lib/commands/getTauriCommands";

interface DevToolsState {
  isRegenerating: boolean;
  regenerateZipFiles: () => Promise<void>;
}

/**
 * Module-level store so the regeneration status survives navigating away from
 * and back to the dev tools page. The task runs inside the action, decoupled
 * from any component's mount lifecycle.
 */
export const useDevToolsStore = create<DevToolsState>((set, get) => ({
  isRegenerating: false,
  regenerateZipFiles: async () => {
    // Avoid kicking off a second run while one is already in progress.
    if (get().isRegenerating) return;

    const { regenerateZipFilesInRegistry } = getTauriCommands();
    set({ isRegenerating: true });
    try {
      await regenerateZipFilesInRegistry();
    } catch (err) {
      console.error("Failed to regenerate zip files in registry:", err);
    } finally {
      set({ isRegenerating: false });
    }
  },
}));
