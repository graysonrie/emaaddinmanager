import { useEffect, useState } from "react";
import { AddinPermissionModel } from "./types";
import { convertPackagesToPermissions } from "./types";
import { AddinPackageInfoModel } from "@/lib/models/addin-package-info.model";
import getTauriCommands from "@/lib/commands/getTauriCommands";

export default function useAddinPackagesAsPermissions() {
  const [permissions, setPermissions] = useState<AddinPermissionModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissionsFromPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tauriCommands = getTauriCommands();
      const packages: AddinPackageInfoModel[] =
        await tauriCommands.getAllAddinPackages();

      // Convert packages to permissions
      const convertedPermissions = convertPackagesToPermissions(packages);
      setPermissions(convertedPermissions);
    } catch (err) {
      console.error("Failed to load permissions from packages:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load permissions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPermissions = () => {
    loadPermissionsFromPackages();
  };

  useEffect(() => {
    loadPermissionsFromPackages();
  }, []);

  return {
    permissions,
    isLoading,
    error,
    refreshPermissions,
  };
}
