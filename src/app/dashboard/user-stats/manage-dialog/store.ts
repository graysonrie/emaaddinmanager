import { create } from "zustand";

interface Store {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  userEmail: string;
  setUserEmailAndName: (userEmail: string, userName: string) => void;
  userName: string;

  unregisteringUser: string | undefined;
  setUnregisteringUser: (unregisteringUser: string | undefined) => void;

  settingTempPassword: string | undefined;
  setSettingTempPassword: (settingTempPassword: string | undefined) => void;
  isConfirmingTempPassword: boolean;
  setIsConfirmingTempPassword: (isConfirming: boolean) => void;

  // Temporary blocked addin paths state
  tempBlockedAddinPaths: string[];
  setTempBlockedAddinPaths: (paths: string[]) => void;
  toggleTempBlockedAddinPath: (addinPath: string) => void;
  isTempBlockedAddinPath: (addinPath: string) => boolean;
  resetTempPermissions: () => void;
}

export const useManageDialogStore = create<Store>((set, get) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) =>
    set({ isVisible, unregisteringUser: undefined, settingTempPassword: undefined, isConfirmingTempPassword: false }),
  userEmail: "",
  setUserEmailAndName: (userEmail: string, userName: string) =>
    set({ userEmail, userName }),
  userName: "",
  unregisteringUser: undefined,
  setUnregisteringUser: (unregisteringUser: string | undefined) =>
    set({ unregisteringUser }),
  settingTempPassword: undefined,
  setSettingTempPassword: (settingTempPassword: string | undefined) =>
    set({ settingTempPassword, isConfirmingTempPassword: false }),
  isConfirmingTempPassword: false,
  setIsConfirmingTempPassword: (isConfirming: boolean) =>
    set({ isConfirmingTempPassword: isConfirming }),

  // Temporary blocked addin paths state
  tempBlockedAddinPaths: [],
  setTempBlockedAddinPaths: (paths: string[]) =>
    set({ tempBlockedAddinPaths: paths }),
  toggleTempBlockedAddinPath: (addinPath: string) => {
    const { tempBlockedAddinPaths } = get();
    const isCurrentlyBlocked = tempBlockedAddinPaths.includes(addinPath);

    if (isCurrentlyBlocked) {
      // Remove the path (unblock)
      const newPaths = tempBlockedAddinPaths.filter(
        (path) => path !== addinPath
      );
      set({ tempBlockedAddinPaths: newPaths });
    } else {
      // Add the path (block)
      const newPaths = [...tempBlockedAddinPaths, addinPath].sort();
      set({ tempBlockedAddinPaths: newPaths });
    }
  },
  isTempBlockedAddinPath: (addinPath: string) => {
    const { tempBlockedAddinPaths } = get();
    return tempBlockedAddinPaths.includes(addinPath);
  },
  resetTempPermissions: () => set({ tempBlockedAddinPaths: [] }),
}));
