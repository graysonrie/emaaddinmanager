import { AddinPermissionModel } from "@/lib/addins/addin-management/types";
import { create } from "zustand";

interface Store {
  step: "name" | "permissions" | "done";
  setStep: (step: "name" | "permissions" | "done") => void;

  userName: string;
  setUserName: (userName: string) => void;
  permission: AddinPermissionModel | undefined;
  setPermission: (permission: AddinPermissionModel) => void;
  adminKey: string;
  setAdminKey: (adminKey: string) => void;

  error: string | undefined;
  setError: (error: string | undefined) => void;
}

export const useSetupStore = create<Store>((set) => ({
  step: "name",
  setStep: (step: "name" | "permissions" | "done") => set({ step }),
  userName: "",
  setUserName: (userName: string) => set({ userName }),
  permission: undefined,
  setPermission: (permission: AddinPermissionModel) => set({ permission }),
  adminKey: "",
  setAdminKey: (adminKey: string) => set({ adminKey }),
  error: undefined,
  setError: (error: string | undefined) => set({ error }),
}));
