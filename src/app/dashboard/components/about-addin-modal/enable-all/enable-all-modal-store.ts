import { AddinPermissionModel } from "@/lib/addins/addin-management/types";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinModel } from "@/lib/models/addin.model";
import { getConfigValue } from "@/lib/persistence/config/getConfigValue";
import { normalizePath, removeTrailingSlash } from "@/lib/utils";
import { create } from "zustand";

interface EnableAllAddinModalState {
  isOpen: boolean;
  setIsOpen: (
    value: boolean,
    model: AddinModel,
    permission: AddinPermissionModel
  ) => void;
  __setIsOpen: (value: boolean) => void;
  addinModel: AddinModel | undefined;
  addinPermissionModel: AddinPermissionModel | undefined;
}

export const useEnableAllAddinModalStore = create<EnableAllAddinModalState>(
  (set) => ({
    isOpen: false,
    setIsOpen: (value, model, permission) => {
      console.log(model);
      set({
        isOpen: value,
        addinModel: model,
        addinPermissionModel: permission,
      });
    },
    __setIsOpen: (value) => {
      set({ isOpen: value });
    },
    // TODO: set to undefined
    addinModel: undefined,
    addinPermissionModel: undefined,
  })
);
