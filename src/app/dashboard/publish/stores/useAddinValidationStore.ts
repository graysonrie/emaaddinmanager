import { create } from "zustand";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import {
  getFileNameFromPath,
  getParentDirectoryFromPath,
  normalizePath,
} from "@/lib/utils";
import { getAddinCsharpProjectName } from "@/lib/models/addin.model";
import { usePublishDestinationStore } from "./usePublishDestinationStore";
import { useLocalAddinExporterStore } from "./useLocalAddinExporterStore";
import { AddinModel } from "@/lib/models/addin.model";

interface AddinValidationStore {
  existingAddinsInRegistry: (refresh?: boolean) => Promise<AddinModel[]>;
  isAllAddinInfoFilled: () => boolean;
  isTryingToPublishExistingAddin: () => Promise<boolean>;
}

export const useAddinValidationStore = create<AddinValidationStore>(
  (set, get) => ({
    overrideDestinationPath: undefined,
    addinFileInfo: null,

    existingAddinsInRegistry: async (refresh: boolean = true) => {
      const { addinFileInfo } = useLocalAddinExporterStore.getState();
      const { refreshRegistry } = useAddinRegistryStore.getState();
      if (refresh) {
        await refreshRegistry();
      }

      // Get the updated state after refresh
      const { addins } = useAddinRegistryStore.getState();

      if (!addinFileInfo) {
        console.warn("Addin file info is not set");
        return [];
      }
      if (addins.length === 0) {
        console.warn("No addins in registry");
        return [];
      }
      const existing = addins.filter((a) => {
        const csharpProjectName = getAddinCsharpProjectName(a);
        return csharpProjectName === addinFileInfo.csharpProjectName;
      });
      return existing;
    },

    isTryingToPublishExistingAddin: async () => {
      const { destinationCategory } = usePublishDestinationStore.getState();
      const existingAddins = await get().existingAddinsInRegistry(false);
      if (existingAddins.length === 0) return false;

      const existingAddin = existingAddins[0]; // Take the first match
      const existingAddinParent = getParentDirectoryFromPath(
        existingAddin.pathToAddinDllFolder ?? ""
      );
      const existingAddinParentNormalized = normalizePath(existingAddinParent);
      const destinationPathNormalized = normalizePath(
        destinationCategory?.fullPath ?? ""
      );
      const result =
        existingAddinParentNormalized === destinationPathNormalized;
      console.log("result", result);
      return result;
    },

    isAllAddinInfoFilled: () => {
      const { addinFileInfo } = useLocalAddinExporterStore.getState();
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
  })
);
