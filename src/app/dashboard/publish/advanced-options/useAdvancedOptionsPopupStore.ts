import { DllModel } from "@/lib/models/dll.model";
import { create } from "zustand";

export interface SelectedDllModel {
  dll: DllModel;
  canBeUntoggled: boolean;
}

interface AdvancedOptionsPopupStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  availableProjectDlls: DllModel[];
  setAvailableProjectDlls: (availableProjectDlls: DllModel[]) => void;
  selectedProjectDlls: SelectedDllModel[];
  setSelectedProjectDlls: (selectedProjectDlls: SelectedDllModel[]) => void;
}

export const useAdvancedOptionsPopupStore = create<AdvancedOptionsPopupStore>(
  (set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    availableProjectDlls: [],
    setAvailableProjectDlls: (availableProjectDlls) =>
      set({ availableProjectDlls }),
    selectedProjectDlls: [],
    setSelectedProjectDlls: (selectedProjectDlls) =>
      set({ selectedProjectDlls }),
  })
);
