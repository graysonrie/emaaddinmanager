import { create } from "zustand";

interface Store {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  userEmail: string;
  setUserEmailAndName: (userEmail: string, userName: string) => void;
  userName: string;

  unregisteringUser: string | undefined;
  setUnregisteringUser: (unregisteringUser: string | undefined) => void;
}

export const useManageDialogStore = create<Store>((set) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) => set({ isVisible, unregisteringUser: undefined }),
  userEmail: "",
  setUserEmailAndName: (userEmail: string, userName: string) =>
    set({ userEmail, userName }),
  userName: "",
  unregisteringUser: undefined,
  setUnregisteringUser: (unregisteringUser: string | undefined) =>
    set({ unregisteringUser }),
}));
