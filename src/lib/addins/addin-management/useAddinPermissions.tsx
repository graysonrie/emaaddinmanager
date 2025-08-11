import { useEffect, useState } from "react";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinPermissionModel, convertPackagesToPermissions } from "./types";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { AddinPackageInfoModel } from "@/lib/models/addin-package-info.model";

interface Props {
  userEmail: string;
}

export default function useAddinPermissions({ userEmail }: Props) {
  const [allowedAddins, setAllowedAddins] = useState<AddinPermissionModel[]>(
    []
  );
  const [allAvailableAddins, setAllAvailableAddins] = useState<
    AddinPermissionModel[]
  >([]);
  const [hasUserRegistered, setHasUserRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuthStore();

  const initialize = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    try {
      // Load all available addins first
      const tauriCommands = getTauriCommands();
      const packages: AddinPackageInfoModel[] =
        await tauriCommands.getAllAddinPackages();
      const convertedPermissions = convertPackagesToPermissions(packages);
      console.log(
        "Loaded addin packages:",
        packages.length,
        "Converted to permissions:",
        convertedPermissions.length
      );

      setAllAvailableAddins(convertedPermissions);

      // Then fetch user-specific data
      const user = await tauriCommands.getUser(userEmail);
      if (user) {
        const isAdminUser = await isAdmin(userEmail);

        if (isAdminUser === "admin" || isAdminUser === "super") {
          // If the user is an admin, show all addins
          setAllowedAddins(convertedPermissions);
        } else {
          const filteredAddins = user.allowedAddinPaths
            .map((path) => {
              const addin = convertedPermissions.find(
                (addin) => addin.relativePathToAddin === path
              );
              if (!addin) {
                console.warn(`Addin not found: ${path}`);
                return undefined;
              }
              return addin;
            })
            .filter((addin) => addin !== undefined) as AddinPermissionModel[];

          setAllowedAddins(filteredAddins);
        }

        setHasUserRegistered(true);
      } else {
        setHasUserRegistered(false);
        setAllowedAddins([]);
      }
    } catch (error) {
      console.error("Failed to initialize addin permissions:", error);
      // Fallback to empty arrays if something fails
      setAllAvailableAddins([]);
      setAllowedAddins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setAllowedAddinPaths = async (paths: string[]) => {
    if (!userEmail) return;

    console.log("Setting allowed addin paths", paths);
    await getTauriCommands().setAllowedAddinPathsForUser(userEmail, paths);

    // Refresh user data after updating permissions
    const user = await getTauriCommands().getUser(userEmail);
    if (user) {
      const isAdminUser = await isAdmin(userEmail);

      if (isAdminUser === "admin" || isAdminUser === "super") {
        setAllowedAddins(allAvailableAddins);
      } else {
        const filteredAddins = user.allowedAddinPaths
          .map((path) => {
            const addin = allAvailableAddins.find(
              (addin) => addin.relativePathToAddin === path
            );
            if (!addin) {
              console.warn(`Addin not found: ${path}`);
              return undefined;
            }
            return addin;
          })
          .filter((addin) => addin !== undefined) as AddinPermissionModel[];

        setAllowedAddins(filteredAddins);
      }
    }
  };

  const isAllowedAddinPath = (path: string) => {
    return allowedAddins.some((addin) => addin.relativePathToAddin === path);
  };

  const refreshAddins = async () => {
    await initialize();
  };

  // Initialize when userEmail changes
  useEffect(() => {
    if (userEmail) {
      initialize();
    }
  }, [userEmail]);

  return {
    allowedAddins,
    allAvailableAddins,
    hasUserRegistered,
    isLoading,
    isAllowedAddinPath,
    setAllowedAddinPaths,
    refreshAddins,
  };
}
