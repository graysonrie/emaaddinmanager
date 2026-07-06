import { Update } from "@tauri-apps/plugin-updater";
import { create } from "zustand";

interface UpdateStore {
  update: Update | undefined;
  setUpdate: (update: Update | undefined) => void;
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  update: undefined,
  setUpdate: (update) => set({ update }),
}));
