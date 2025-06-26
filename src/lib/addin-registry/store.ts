import { create } from "zustand";

interface AddinRegistryState {
    localRegistryPath: string;
    setLocalRegistryPath: (path: string) => void;
}

export const useAddinRegistryStore = create<AddinRegistryState>((set) => ({
  localRegistryPath: "S:\\BasesRevitAddinsRegistry",
  setLocalRegistryPath: (path: string) => set({ localRegistryPath: path }),
}));