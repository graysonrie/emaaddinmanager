import { create } from "zustand";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useAddinRegistryStore } from "@/lib/addin-registry/useAddinRegistryStore";
import { getParentDirectoryFromPath } from "@/lib/utils";
import { getAddinCsharpProjectName } from "@/lib/models/addin.model";

interface AddinValidationStore {
  overrideDestinationPath: string | undefined;
  addinFileInfo: SimplifiedAddinInfoModel | null;

  // Actions
  setAddinFileInfo: (addinFileInfo: SimplifiedAddinInfoModel | null) => void;
  existingAddinsInRegistry: () => any;
  isAllAddinInfoFilled: () => boolean;
  updateOverrideDestinationPath: () => void;
}

export const useAddinValidationStore = create<AddinValidationStore>(
  (set, get) => ({
    overrideDestinationPath: undefined,
    addinFileInfo: null,

    setAddinFileInfo: (addinFileInfo: SimplifiedAddinInfoModel | null) => {
      set({ addinFileInfo });
      get().updateOverrideDestinationPath();
    },

    existingAddinsInRegistry: () => {
      const { addinFileInfo } = get();
      const { addins } = useAddinRegistryStore.getState();

      if (!addinFileInfo) {
        console.warn("Addin file info is not set");
        return undefined;
      }
      const existing = addins.find((a) => {
        const csharpProjectName = getAddinCsharpProjectName(a);
        return csharpProjectName === addinFileInfo.csharpProjectName;
      });
      return existing;
    },

    isAllAddinInfoFilled: () => {
      const { addinFileInfo } = get();
      if (!addinFileInfo) {
        return false;
      }
      return !!(
        addinFileInfo.name &&
        addinFileInfo.description &&
        addinFileInfo.vendorId &&
        addinFileInfo.email
      );
    },

    updateOverrideDestinationPath: () => {
      const existingAddin = get().existingAddinsInRegistry();
      if (existingAddin) {
        console.log("existingAddin", existingAddin);
        const parentDirectory = getParentDirectoryFromPath(
          existingAddin.pathToAddinDllFolder
        );
        console.log("parentDirectory", parentDirectory);
        set({ overrideDestinationPath: parentDirectory });
      } else {
        set({ overrideDestinationPath: undefined });
      }
    },
  })
);
