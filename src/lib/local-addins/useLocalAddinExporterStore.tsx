import { create } from "zustand";
import { DllModel } from "@/lib/models/dll.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import useTauriCommands from "@/lib/commands/getTauriCommands";
import { getEmptySimplifiedAddinInfo } from "@/lib/models/simplified-addin-info.model";
import { ErrorList } from "@/types/error-list";

interface LocalAddinExporterState {
  projectDir: string | null;
  addinFileInfo: SimplifiedAddinInfoModel | null;
  dlls: DllModel[];
  loading: boolean;
  error: string | null;
  setProjectDir: (dir: string | null) => void;
  setAddinFileInfo: (info: SimplifiedAddinInfoModel | null) => void;
  setDlls: (dlls: DllModel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  /**
   * Exports the addin to the destination directory
   * @param addinFileInfo - The addin file info
   * @param extraDlls - The extra DLLs to include. Should not be full paths. Only the name of the DLL is needed without the .dll suffix. The command `getAllProjectDlls` should be used to get the names of the DLLs since it follows this restriction.
   * @param destinationDir - The destination directory
   * @returns The export result
   */
  exportAddin: (
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => Promise<ErrorList>;
  buildAddin: () => Promise<string>;
  getAllProjectDlls: () => Promise<DllModel[]>;
}

const tauri = useTauriCommands();

export const useLocalAddinExporterStore = create<LocalAddinExporterState>(
  (set, get) => ({
    projectDir: null,
    addinFileInfo: null,
    dlls: [],
    loading: false,
    error: null,
    setProjectDir: (dir) => set({ projectDir: dir }),
    setAddinFileInfo: (info) => set({ addinFileInfo: info }),
    setDlls: (dlls) => set({ dlls }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    refresh: async () => {
      const projectDir = get().projectDir;
      if (!projectDir) {
        throw new Error("Project directory not set");
      }
      set({ loading: true, error: null });
      try {
        console.log(
          "Refreshing local addin information for project:",
          projectDir
        );
        const addinFileInfo = await tauri.getAddinFileInfo(projectDir);
        console.log("Addin file info found for project:", projectDir);
        // const dlls = await tauri.getAllProjectDlls(projectDir);
        set({ addinFileInfo });
      } catch (err) {
        if (
          typeof err === "string" &&
          err.includes("AddinFileError(FileNotFound)")
        ) {
          console.warn("Addin file not found, setting empty addin info");
          set({ addinFileInfo: getEmptySimplifiedAddinInfo() });
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to refresh";
        set({ error: errorMessage });
        console.error("Error loading local addin information:", err);
      } finally {
        set({ loading: false });
      }
    },
    exportAddin: async (addinFileInfo, extraDlls, destinationDir) => {
      const projectDir = get().projectDir;
      if (!projectDir) {
        throw new Error("Project directory not set");
      }
      const exportResult = await tauri.exportAddin(
        projectDir,
        addinFileInfo,
        extraDlls,
        destinationDir
      );
      return exportResult;
    },
    buildAddin: async () => {
      const projectDir = get().projectDir;
      if (!projectDir) {
        throw new Error("Project directory not set");
      }
      const buildResult = await tauri.buildAddin(projectDir);
      return buildResult;
    },
    getAllProjectDlls: async () => {
      const projectDir = get().projectDir;
      if (!projectDir) {
        throw new Error("Project directory not set");
      }
      console.log("Getting all project DLLs for project:", projectDir);
      const dlls = await tauri.getAllProjectDlls(projectDir);
      set({ dlls });
      return dlls;
    },
  })
);
