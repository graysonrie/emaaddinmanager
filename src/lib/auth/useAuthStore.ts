import { create } from "zustand";
import { getConfigValue } from "../persistence/config/getConfigValue";

// TODO: use something more sophisticated
const ADMIN_USER_EMAILS = [
  "grieger@emaengineer.com",
  "skhadka@emaengineer.com",
  "jbright@emaengineer.com",
  "lcasey@emaengineer.com",
];

interface Store {
  isAdmin: () => Promise<boolean>;
}

export const useAuthStore = create<Store>(() => ({
  isAdmin: async () => {
    const userEmail = await getConfigValue("userEmail");
    if (userEmail) {
      if (ADMIN_USER_EMAILS.includes(userEmail)) {
        return true;
      }
    }
    return false;
  },
}));
