import { useEffect, useState } from "react";
import useTauriCommands from "../commands/useTauriCommands";
import useConfig from "../persistence/config/useConfig";
import { useConfigValueOrDefault } from "../persistence/config/useConfigValue";
import { AddinModel } from "../models/addin.model";
import { CategoryModel } from "../models/category.model";

export default function useAddinRegistry() {
  const { getAddins, installAddin, getCategories } = useTauriCommands();
  const { update } = useConfig();
  const {
    data: localRegistryPath,
    loading: configLoading,
    error: configError,
  } = useConfigValueOrDefault(
    "localAddinRegistryPath",
    "S:\\BasesRevitAddinsRegistry"
  );

  const [addins, setAddins] = useState<AddinModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAddins, setIsLoadingAddins] = useState(false);
  const [addinsError, setAddinsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  // TODO: set to true in production
  const [canChangeRegistryPath, setCanChangeRegistryPath] = useState(true);

  // Function to load addins and categories
  const loadRegistryData = async (path: string) => {
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
      await loadRegistryData(localRegistryPath);
    }
  };

  // Load addins when registry path changes
  useEffect(() => {
    if (localRegistryPath) {
      loadRegistryData(localRegistryPath);
    }
  }, [localRegistryPath]);

  // Update loading state when config is ready
  useEffect(() => {
    if (!configLoading) {
      setIsLoading(false);
    }
  }, [configLoading]);

  const changeRegistryPath = async (path: string) => {
    if (canChangeRegistryPath) {
      try {
        await update("localAddinRegistryPath", path);
      } catch (error) {
        console.error("Failed to update addin registry path in config:", error);
      }
    }
  };

  return {
    addins,
    installAddin,
    changeRegistryPath,
    canChangeRegistryPath,
    setCanChangeRegistryPath,
    localRegistryPath,
    isLoading: isLoading || configLoading || isLoadingAddins,
    configError,
    addinsError,
    categories,
    categoriesError,
    refreshRegistry,
  };
}
