import { AddinPermissionModel } from "@/lib/addins/addin-management/types";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinModel } from "@/lib/models/addin.model";
import { getConfigValue } from "@/lib/persistence/config/getConfigValue";
import { normalizePath, removeTrailingSlash } from "@/lib/utils";
import { create } from "zustand";

interface ReportErrorModalState {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const useReportAddinErrorModalStore = create<ReportErrorModalState>((set) => ({
  isOpen: false,
  setIsOpen: (value) => {
    set({ isOpen: value });
  },
}));
