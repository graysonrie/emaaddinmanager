import { create } from "zustand";

interface Store {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const useCreateNewCodeSnippetStore = create<Store>((set, get) => {
  return {
    isOpen: false,
    setIsOpen: (value) => {
      set({
        isOpen: value,
      });
    },
  };
});
