import { AddinPermissionModel } from "@/lib/addins/addin-management/types";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinModel } from "@/lib/models/addin.model";
import { getConfigValue } from "@/lib/persistence/config/getConfigValue";
import { normalizePath, removeTrailingSlash } from "@/lib/utils";
import { create } from "zustand";

interface AboutAddinModalState {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  permissionModel: AddinPermissionModel | undefined;
  setPermissionModel: (model: AddinPermissionModel) => Promise<void>;
  addinModel: AddinModel | undefined;
  error: string | undefined;
  hasFullyLoaded: boolean;
}

export const useAboutAddinModalStore = create<AboutAddinModalState>((set) => ({
  isOpen: false,
  hasFullyLoaded: false,
  setIsOpen: (value) => {
    set({ isOpen: value });
  },
  permissionModel: undefined,
  addinModel: undefined,
  error: undefined,
  setPermissionModel: async (model) => {
    set({ hasFullyLoaded: false });
    let error = undefined;
    const addinRegistry = useAddinRegistryStore.getState();

    await addinRegistry.refreshRegistry();
    await addinRegistry.loadRegistryData();

    const localRegistryPath = await getConfigValue("localAddinRegistryPath");
    if (!localRegistryPath) {
      console.warn("no registry  path");
      error = "failed to load registry";
    }

    let correspondingAddin = undefined;
    if (localRegistryPath) {
      // Refresh the state so 'addins' is updated
      const addins = useAddinRegistryStore.getState().addins;

      console.log("all addins", addins);

      correspondingAddin = addins.find((addin) => {
        const name = addin.pathToAddinDllFolder;
        const normalizedRegistryPath = normalizePath(localRegistryPath);
        const normalized = normalizePath(name);
        const normalizedCutoff = removeTrailingSlash(
          normalized.replace(normalizedRegistryPath, "")
        );

        // console.log("found name", normalizedCutoff);
        // console.log(
        //   "compare to ",
        //   model.referenceAddinPackage.relativePathToAddin
        // );
        return (
          normalizedCutoff == model.referenceAddinPackage.relativePathToAddin
        );
      });
    }

    if (correspondingAddin == undefined) {
      error = `Info for ${model.displayName} is currently unavailable`;
    }

    set({
      hasFullyLoaded: true,
      permissionModel: model,
      addinModel: correspondingAddin,
      error,
    });
  },
}));
