import { create } from "zustand";

interface WhatsNewPopupStore {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

export const useWhatsNewPopupStore = create<WhatsNewPopupStore>((set) => ({
  isVisible: false,
  setIsVisible: (isVisible: boolean) => set({ isVisible }),
}));
