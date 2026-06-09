import { create } from "zustand";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface HelpTicketsState {
  adminViewOverride: boolean | null;
  setAdminViewOverride: (value: boolean | null) => void;
  isAdminView: () => Promise<boolean>;
}

export const useHelpTicketsStore = create<HelpTicketsState>((set, get) => ({
  adminViewOverride: null,

  setAdminViewOverride: (value) => {
    set({ adminViewOverride: value });
  },

  isAdminView: async (): Promise<boolean> => {
    const override = get().adminViewOverride;
    if (override !== null) {
      return override;
    }
    const status = await useAuthStore.getState().amIAnAdmin();
    return status === "admin" || status === "super";
  },
}));
