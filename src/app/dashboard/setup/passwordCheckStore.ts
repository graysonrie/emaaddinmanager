import { create } from "zustand";

interface PasswordCheckStore {
  cachedEmail: string | null;
  isPasswordSetForSelf: boolean | null;
  isTempPassword: boolean | null;
  isChecking: boolean;
  justSetPassword: boolean;
  setChecking: (checking: boolean) => void;
  setPasswordSetResult: (
    email: string | null,
    isSet: boolean | null,
  ) => void;
  setTempPassword: (isTemp: boolean | null) => void;
  setJustSetPassword: (value: boolean) => void;
  reset: () => void;
}

export const usePasswordCheckStore = create<PasswordCheckStore>((set) => ({
  cachedEmail: null,
  isPasswordSetForSelf: null,
  isTempPassword: null,
  isChecking: false,
  justSetPassword: false,
  setChecking: (checking) => set({ isChecking: checking }),
  setPasswordSetResult: (email, isSet) =>
    set({
      cachedEmail: email,
      isPasswordSetForSelf: isSet,
      isChecking: false,
    }),
  setTempPassword: (isTemp) => set({ isTempPassword: isTemp }),
  setJustSetPassword: (value) => set({ justSetPassword: value }),
  reset: () =>
    set({
      cachedEmail: null,
      isPasswordSetForSelf: null,
      isTempPassword: null,
      isChecking: false,
      justSetPassword: false,
    }),
}));
