import { create } from "zustand";
import getTauriCommands from "../commands/getTauriCommands";
import getServerCommands from "../server/getServerCommands";

type AdminStatus = "none" | "admin" | "super";

interface Store {
  amIAnAdmin: () => Promise<AdminStatus>;
  isAdmin: (email: string) => Promise<AdminStatus>;
}

export const useAuthStore = create<Store>(() => ({
  amIAnAdmin: async () => {
    const { getRole } = getServerCommands();
    try {
      const role = await getRole();
      if (role === "superAdmin") {
        return "super";
      }
      if (role === "admin") {
        return "admin";
      }
      return "none";
    } catch (e) {
      console.warn("err when checking amIAnAdmin:", e);
      return "none";
    }
  },
  isAdmin: async (email: string) => {
    const { getRoleFromEmail } = getServerCommands();
    try {
      const role = await getRoleFromEmail(email);
      if (role === "superAdmin") {
        return "super";
      }
      if (role === "admin") {
        return "admin";
      }
      return "none";
    } catch (e) {
      console.warn("err when checking isAdmin:", e);
      return "none";
    }
  },
}));
