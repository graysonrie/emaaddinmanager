import { create } from "zustand";

interface Store {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  userEmail: string;
  setUserEmailAndName: (userEmail: string, userName: string) => void;
  userName: string;

  unregisteringUser: string | undefined;
  setUnregisteringUser: (unregisteringUser: string | undefined) => void;

  // Temporary addin permissions state
  tempAllowedAddinPaths: string[];
  setTempAllowedAddinPaths: (paths: string[]) => void;
  toggleTempAddinPermission: (addinPath: string) => void;
  isTempAllowedAddinPath: (addinPath: string) => boolean;
  resetTempPermissions: () => void;
}

export const useManageDialogStore = create<Store>((set, get) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) =>
    set({ isVisible, unregisteringUser: undefined }),
  userEmail: "",
  setUserEmailAndName: (userEmail: string, userName: string) =>
    set({ userEmail, userName }),
  userName: "",
  unregisteringUser: undefined,
  setUnregisteringUser: (unregisteringUser: string | undefined) =>
    set({ unregisteringUser }),

  // Temporary addin permissions state
  tempAllowedAddinPaths: [],
  setTempAllowedAddinPaths: (paths: string[]) =>
    set({ tempAllowedAddinPaths: paths }),
  toggleTempAddinPermission: (addinPath: string) => {
    const { tempAllowedAddinPaths } = get();
    const isCurrentlyAllowed = tempAllowedAddinPaths.includes(addinPath);

    if (isCurrentlyAllowed) {
      // Remove the path
      const newPaths = tempAllowedAddinPaths.filter(
        (path) => path !== addinPath
      );
      set({ tempAllowedAddinPaths: newPaths });
    } else {
      // Add the path
      const newPaths = [...tempAllowedAddinPaths, addinPath].sort();
      set({ tempAllowedAddinPaths: newPaths });
    }
  },
  isTempAllowedAddinPath: (addinPath: string) => {
    const { tempAllowedAddinPaths } = get();
    return tempAllowedAddinPaths.includes(addinPath);
  },
  resetTempPermissions: () => set({ tempAllowedAddinPaths: [] }),
}));
