import { useEffect, useState } from "react";
import useTauriCommands from "../commands/useTauriCommands";
import useConfig from "../persistence/config/useConfig";
import { useConfigValueOrDefault } from "../persistence/config/useConfigValue";
import { AddinModel } from "../models/addin.model";

export default function useAddinRegistry() {
  const { getAddins, installAddin } = useTauriCommands();
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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAddins, setIsLoadingAddins] = useState(false);
  const [addinsError, setAddinsError] = useState<string | null>(null);
  // TODO: set to true in production
  const [canChangeRegistryPath, setCanChangeRegistryPath] = useState(true);

  // Load addins when registry path changes
  useEffect(() => {
    if (localRegistryPath) {
      setIsLoadingAddins(true);
      setAddinsError(null);

      getAddins(localRegistryPath)
        .then((addins) => {
          console.log("Addins loaded from hook:", addins.length);
          setAddins(addins);
          setIsLoadingAddins(false);
        })
        .catch((error) => {
          console.error("Failed to load addins:", error);
          setAddinsError(
            error instanceof Error ? error.message : "Failed to load addins"
          );
          setIsLoadingAddins(false);
        });
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
  };
}
