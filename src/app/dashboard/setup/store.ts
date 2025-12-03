import { create } from "zustand";

interface SetupStore {
  forcePasswordChange: boolean;
  setForcePasswordChange: (force: boolean) => void;
}

export const useSetupStore = create<SetupStore>((set) => ({
  forcePasswordChange: false,
  setForcePasswordChange: (force: boolean) => set({ forcePasswordChange: force }),
}));

