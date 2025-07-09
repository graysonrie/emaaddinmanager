import { useEffect, useState } from "react";
import useTauriCommands from "../commands/getTauriCommands";
import { AddinModel } from "../models/addin.model";

export default function useLocalAddins() {
  const {
    getLocalAddins,
    getRevitVersions,
    uninstallAddins,
    getCategories,
    
  } = useTauriCommands();
  const [addins, setAddins] = useState<AddinModel[]>([]);
  const [revitVersions, setRevitVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAddins = async () => {
    try {
      setLoading(true);
      setError(null);
      const localAddins = await getLocalAddins();
      setAddins(localAddins);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load local addins";
      setError(errorMessage);
      console.error("Error loading local addins:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRevitVersions = async () => {
    try {
      const versions = await getRevitVersions();
      setRevitVersions(versions);
    } catch (err) {
      console.error("Error loading Revit versions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load Revit versions"
      );
    }
  };

  useEffect(() => {
    refreshAddins();
    refreshRevitVersions();
  }, []);

  return {
    addins,
    revitVersions,
    loading,
    error,
    refreshAddins,
    refreshRevitVersions,
    uninstallAddins,
  };
}
