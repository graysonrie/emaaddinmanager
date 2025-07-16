import { create } from "zustand";
import { useEffect } from "react";
import useTauriCommands from "../commands/getTauriCommands";
import useConfig from "../persistence/config/useConfig";
import { useConfigValue } from "../persistence/config/useConfigValue";
import { AddinModel } from "../models/addin.model";
import { CategoryModel } from "../models/category.model";

interface AddinRegistryStore {
  addins: AddinModel[];
  categories: CategoryModel[];
  isLoading: boolean;
  isLoadingAddins: boolean;
  addinsError: string | null;
  categoriesError: string | null;
  canChangeRegistryPath: boolean;
  localRegistryPath: string | null;

  // Actions
  loadRegistryData: () => Promise<void>;
  refreshRegistry: () => Promise<void>;
  changeRegistryPath: (path: string) => Promise<void>;
  delistAddin: (addin: AddinModel) => Promise<void>;
  installAddins: (installRequests: any[]) => Promise<any>;
  setCanChangeRegistryPath: (canChange: boolean) => void;
  setLocalRegistryPath: (path: string | null) => void;
}

export const useAddinRegistryStore = create<AddinRegistryStore>((set, get) => ({
  addins: [],
  categories: [],
  isLoading: true,
  isLoadingAddins: false,
  addinsError: null,
  categoriesError: null,
  canChangeRegistryPath: true,
  localRegistryPath: null,

  loadRegistryData: async () => {
    const { getAddins, getCategories } = useTauriCommands();
    const path = get().localRegistryPath;

    if (!path) {
      set({
        addinsError: "No registry path found",
        categoriesError: "No registry path found",
        isLoadingAddins: false,
      });
      return;
    }

    set({ isLoadingAddins: true, addinsError: null, categoriesError: null });

    try {
      // Load addins
      const addins = await getAddins(path);
      console.log("Addins loaded from store:", addins.length);

      // Load categories
      const categories = await getCategories(path);

      set({ addins, categories });
    } catch (error) {
      console.error("Failed to load registry data:", error);
      set({
        addinsError:
          error instanceof Error ? error.message : "Failed to load addins",
        categoriesError:
          error instanceof Error ? error.message : "Failed to load categories",
      });
    } finally {
      set({ isLoadingAddins: false });
    }
  },

  refreshRegistry: async () => {
    const { localRegistryPath } = get();
    if (localRegistryPath) {
      console.log("Manually refreshing addin registry...");
      await get().loadRegistryData();
    }
  },

  changeRegistryPath: async (path: string) => {
    const { canChangeRegistryPath } = get();
    if (canChangeRegistryPath) {
      try {
        const { update } = useConfig();
        await update("localAddinRegistryPath", path);
        set({ localRegistryPath: path });
      } catch (error) {
        console.error("Failed to update addin registry path in config:", error);
      }
    }
  },

  delistAddin: async (addin: AddinModel) => {
    const { localRegistryPath } = get();
    if (!localRegistryPath) {
      return;
    }
    const { delistAddin: delistAddinCommand } = useTauriCommands();
    await delistAddinCommand(addin, localRegistryPath);
    await get().refreshRegistry();
  },

  installAddins: async (installRequests: any[]) => {
    const { installAddins } = useTauriCommands();
    return await installAddins(installRequests);
  },

  setCanChangeRegistryPath: (canChange: boolean) => {
    set({ canChangeRegistryPath: canChange });
  },

  setLocalRegistryPath: (path: string | null) => {
    set({ localRegistryPath: path });
  },
}));

// Hook to initialize the store with config values
export const useAddinRegistryStoreInit = () => {
  const { setLocalRegistryPath, loadRegistryData } = useAddinRegistryStore();
  const localRegistryPath = useConfigValue("localAddinRegistryPath");

  useEffect(() => {
    setLocalRegistryPath(localRegistryPath ?? null);
  }, [localRegistryPath, setLocalRegistryPath]);

  useEffect(() => {
    if (localRegistryPath) {
      loadRegistryData();
    }
  }, [localRegistryPath, loadRegistryData]);

  useEffect(() => {
    // Update loading state when config is ready
    useAddinRegistryStore.setState({ isLoading: false });
  }, []);

  return useAddinRegistryStore();
};
