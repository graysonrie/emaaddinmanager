import { create } from "zustand";

interface Store {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  userEmail: string;
  setUserEmailAndName: (userEmail: string, userName: string) => void;
  userName: string;
}

export const useManageDialogStore = create<Store>((set) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) => set({ isVisible }),
  userEmail: "",
  setUserEmailAndName: (userEmail: string, userName: string) =>
    set({ userEmail, userName }),
  userName: "",
}));
