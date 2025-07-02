import { create } from "zustand";
import { DllModel } from "@/lib/models/dll.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import useTauriCommands from "@/lib/commands/getTauriCommands";
import { getEmptySimplifiedAddinInfo } from "@/lib/models/simplified-addin-info.model";

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
  refresh: (projectDir: string) => Promise<void>;
  exportAddin: (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => Promise<void>;
  buildAddin: (projectDir: string) => Promise<string>;
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
    refresh: async (projectDir: string) => {
      set({ loading: true, error: null });
      try {
        const addinFileInfo = await tauri.getAddinFileInfo(projectDir);
        const dlls = await tauri.getAllProjectDlls(projectDir);
        set({ addinFileInfo, dlls });
      } catch (err) {
        if (
          typeof err === "string" &&
          err.includes("AddinFileError(FileNotFound)")
        ) {
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
    exportAddin: tauri.exportAddin,
    buildAddin: tauri.buildAddin,
  })
);
