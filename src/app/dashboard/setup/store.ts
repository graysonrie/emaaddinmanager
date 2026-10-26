import { UserModel } from "@/lib/models/user.model";
import { create } from "zustand";

interface SetupStore {
  user: UserModel | undefined;
  setUser: (model: UserModel | undefined) => void;
}

export const useSetupStore = create<SetupStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));
