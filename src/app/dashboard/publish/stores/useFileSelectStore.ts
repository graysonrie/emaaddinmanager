import { create } from "zustand";
import { open } from "@tauri-apps/plugin-dialog";

interface FileSelectStore {
  isProcessing: boolean;
  handleFileSelect: (
    onProjectSelected: (projectDir: string) => void
  ) => Promise<void>;
}

export const useFileSelectStore = create<FileSelectStore>((set) => ({
  isProcessing: false,

  handleFileSelect: async (onProjectSelected: (projectDir: string) => void) => {
    try {
      set({ isProcessing: true });
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "C# Project Files",
            extensions: ["csproj"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        // Get the parent directory of the selected .csproj file
        const projectDir = selected.substring(0, selected.lastIndexOf("\\"));
        onProjectSelected?.(projectDir);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    } finally {
      set({ isProcessing: false });
    }
  },
}));
