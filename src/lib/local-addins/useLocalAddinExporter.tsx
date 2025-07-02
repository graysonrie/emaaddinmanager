import { useState } from "react";
import useTauriCommands from "../commands/useTauriCommands";
import { DllModel } from "../models/dll.model";
import {
  getEmptySimplifiedAddinInfo,
  SimplifiedAddinInfoModel,
} from "../models/simplified-addin-info.model";

export default function useLocalAddinExporter() {
  const { exportAddin, getAddinFileInfo, getAllProjectDlls, buildAddin } =
    useTauriCommands();

  // The directory of the C# project
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [addinFileInfo, setAddinFileInfo] =
    useState<SimplifiedAddinInfoModel | null>(null);
  const [dlls, setDlls] = useState<DllModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (projectDir: string) => {
    try {
      setLoading(true);
      setError(null);
      const addinFileInfo = await getAddinFileInfo(projectDir);
      const dlls = await getAllProjectDlls(projectDir);
      setAddinFileInfo(addinFileInfo);
      setDlls(dlls);
    } catch (err) {
      if (
        typeof err === "string" &&
        err.includes("AddinFileError(FileNotFound)")
      ) {
        console.warn(
          "No addin file found in the project. Setting empty addin file info."
        );
        setAddinFileInfo(getEmptySimplifiedAddinInfo());
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh";
      setError(errorMessage);
      console.error("Error loading local addin information:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    projectDir,
    setProjectDir,
    exportAddin,
    refresh,
    buildAddin,
    addinFileInfo,
    setAddinFileInfo,
    dlls,
    setDlls,
    loading,
    error,
  };
}
