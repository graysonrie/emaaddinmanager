import { create } from "zustand";

interface Store{
    isVisible:boolean;
    setIsVisible: (isVisible: boolean) => void;
    userEmail:string,
    setUserEmail: (userEmail: string) => void;
}

export const useManageDialogStore = create<Store>((set) => ({
    isVisible: false,
    setIsVisible: (isVisible: boolean) => set({ isVisible }),
    userEmail: "",
    setUserEmail: (userEmail: string) => set({ userEmail }),
}));
