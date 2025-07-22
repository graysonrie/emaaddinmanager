import { create } from "zustand";
import getTauriCommands from "../commands/getTauriCommands";

interface Store {
  isAdmin: () => Promise<boolean>;
}

export const useAuthStore = create<Store>(() => ({
  isAdmin: async () => {
    return await getTauriCommands().isUserAdmin();
  },
}));
