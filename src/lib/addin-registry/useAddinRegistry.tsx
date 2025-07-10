import { useEffect, useState } from "react";
import useTauriCommands from "../commands/getTauriCommands";
import useConfig from "../persistence/config/useConfig";
import { useConfigValue } from "../persistence/config/useConfigValue";
import { AddinModel } from "../models/addin.model";
import { CategoryModel } from "../models/category.model";

export default function useAddinRegistry() {
  const {
    getAddins,
    installAddins,
    getCategories,
    delistAddin: delistAddinCommand,
  } = useTauriCommands();
  const { update } = useConfig();
  const localRegistryPath = useConfigValue("localAddinRegistryPath");

  const [addins, setAddins] = useState<AddinModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAddins, setIsLoadingAddins] = useState(false);
  const [addinsError, setAddinsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  // TODO: set to true in production
  const [canChangeRegistryPath, setCanChangeRegistryPath] = useState(true);

  // Function to load addins and categories
  const loadRegistryData = async () => {
    const path = localRegistryPath;

    if (!path) {
      setAddinsError("No registry path found");
      setCategoriesError("No registry path found");
      setIsLoadingAddins(false);
      return;
    }

    setIsLoadingAddins(true);
    setAddinsError(null);
    setCategoriesError(null);

    try {
      // Load addins
      const addins = await getAddins(path);
      console.log("Addins loaded from hook:", addins.length);
      setAddins(addins);

      // Load categories
      const categories = await getCategories(path);
      setCategories(categories);
    } catch (error) {
      console.error("Failed to load registry data:", error);
      setAddinsError(
        error instanceof Error ? error.message : "Failed to load addins"
      );
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to load categories"
      );
    } finally {
      setIsLoadingAddins(false);
    }
  };

  // Manual refresh function
  const refreshRegistry = async () => {
    if (localRegistryPath) {
      console.log("Manually refreshing addin registry...");
      await loadRegistryData();
    }
  };

  // Load addins when registry path changes
  useEffect(() => {
    if (localRegistryPath) {
      loadRegistryData();
    }
  }, [localRegistryPath]);

  // Update loading state when config is ready
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const changeRegistryPath = async (path: string) => {
    if (canChangeRegistryPath) {
      try {
        await update("localAddinRegistryPath", path);
      } catch (error) {
        console.error("Failed to update addin registry path in config:", error);
      }
    }
  };

  const delistAddin = async (addin: AddinModel) => {
    if (!localRegistryPath) {
      return;
    }
    await delistAddinCommand(addin, localRegistryPath);
    await refreshRegistry();
  };

  return {
    addins,
    installAddins,
    delistAddin,
    changeRegistryPath,
    canChangeRegistryPath,
    setCanChangeRegistryPath,
    localRegistryPath,
    isLoading: isLoading || isLoadingAddins,
    addinsError,
    categories,
    categoriesError,
    refreshRegistry,
  };
}
