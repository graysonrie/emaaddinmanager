import {create} from "zustand";

interface UpdaterPopupStore {
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
}

export const useUpdaterPopupStore = create<UpdaterPopupStore>((set) => ({
    isVisible: false,
    setIsVisible: (isVisible: boolean) => set({ isVisible }),
}));