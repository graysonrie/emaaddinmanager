import { create } from "zustand";
import getTauriCommands from "../commands/getTauriCommands";
import getServerCommands, { UserRole } from "../server/getServerCommands";

interface Store {
  amIAnAdmin: () => Promise<UserRole>;
  isAdmin: (email: string) => Promise<UserRole>;
}

export const useAuthStore = create<Store>(() => ({
  amIAnAdmin: async () => {
    const { getUserRole } = getServerCommands();
    try {
      const role = await getUserRole();
      console.log("user role", role);
      if (role === "SuperAdmin") {
        return "SuperAdmin";
      }
      if (role === "Admin") {
        return "Admin";
      }
      return "User";
    } catch (e) {
      console.warn("err when checking amIAnAdmin:", e);
      return "User";
    }
  },
  isAdmin: async (email: string) => {
    const { getUserRoleFromEmail } = getServerCommands();
    try {
      const role = await getUserRoleFromEmail({ email });
      if (role === "SuperAdmin") {
        return "SuperAdmin";
      }
      if (role === "Admin") {
        return "Admin";
      }
      return "User";
    } catch (e) {
      console.warn("err when checking isAdmin:", e);
      return "User";
    }
  },
}));
