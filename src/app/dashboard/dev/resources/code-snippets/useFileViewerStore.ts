import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FileViewerStore {
  expandedNodes: string[];
  setExpandedNodes: (nodes: string[]) => void;
}

export const useFileViewerStore = create<FileViewerStore>()(
  persist(
    (set) => ({
      expandedNodes: [],
      setExpandedNodes: (nodes) => set({ expandedNodes: nodes }),
    }),
    {
      name: "file-viewer-storage",
    }
  )
);
