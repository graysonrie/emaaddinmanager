import { create } from "zustand";

interface InstalledAddinsStore {
  failedToUninstallAddin: boolean;
  setFailedToUninstallAddin: (failedToUninstallAddin: boolean) => void;
}

export const useInstalledAddinsStore = create<InstalledAddinsStore>((set) => ({
  failedToUninstallAddin: false,
  setFailedToUninstallAddin: (failedToUninstallAddin: boolean) =>
    set({ failedToUninstallAddin }),
}));
