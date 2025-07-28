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

      const destinationPathNormalized = normalizePath(
        destinationCategory?.fullPath ?? ""
      );

      // Check if ANY existing addin is in the destination path
      const hasExistingAddinInDestination = existingAddins.some(
        (existingAddin) => {
          const existingAddinParent = getParentDirectoryFromPath(
            existingAddin.pathToAddinDllFolder ?? ""
          );
          const existingAddinParentNormalized =
            normalizePath(existingAddinParent);
          const isInDestination =
            existingAddinParentNormalized === destinationPathNormalized;

          console.log(`Checking addin: ${existingAddin.name}`);
          console.log(`  Existing path: ${existingAddinParentNormalized}`);
          console.log(`  Destination path: ${destinationPathNormalized}`);
          console.log(`  Is in destination: ${isInDestination}`);

          return isInDestination;
        }
      );

      console.log(
        `Found ${existingAddins.length} existing addins, ${
          hasExistingAddinInDestination ? "one or more" : "none"
        } in destination path`
      );
      return hasExistingAddinInDestination;
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
