import { useEffect, useState } from "react";
import { AddinPermissionModel, AllPublicAddinPermissions } from "./types";

export default function usePublicAddinPermissions() {
  const [permissions, setPermissions] = useState<AddinPermissionModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const perms = await AllPublicAddinPermissions();
        setPermissions(perms);
      } catch (err) {
        console.error("Failed to load public addin permissions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load permissions"
        );
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const refreshPermissions = () => {
    setIsLoading(true);
    AllPublicAddinPermissions()
      .then((perms) => {
        setPermissions(perms);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to refresh public addin permissions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to refresh permissions"
        );
        setPermissions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    permissions,
    isLoading,
    error,
    refreshPermissions,
  };
}
