import { create } from "zustand";
import getTauriCommands from "../commands/getTauriCommands";

type AdminStatus = "none" | "admin" | "super";

interface Store {
  amIAnAdmin: () => Promise<AdminStatus>;
  isAdmin: (email: string) => Promise<AdminStatus>;
}

export const useAuthStore = create<Store>(() => ({
  amIAnAdmin: async () => {
    if (await getTauriCommands().isUserSuperAdmin()) {
      return "super";
    }
    if (await getTauriCommands().isUserAdmin()) {
      return "admin";
    }
    return "none";
  },
  isAdmin: async (email: string) => {
    try {
      if (await getTauriCommands().isOtherUserSuperAdmin(email)) {
        return "super";
      }
      if (await getTauriCommands().isOtherUserAdmin(email)) {
        return "admin";
      }
    } catch (e) {
      console.warn("err when checking isAdmin:", e);
    }
    return "none";
  },
}));
