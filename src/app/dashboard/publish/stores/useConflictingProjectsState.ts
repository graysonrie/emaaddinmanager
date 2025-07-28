import { create } from "zustand";
import { useAddinValidationStore } from "./useAddinValidationStore";
import { AddinModel } from "@/lib/models/addin.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useLocalAddinExporterStore } from "./useLocalAddinExporterStore";

interface ConflictingProjectInfo {
  addin: SimplifiedAddinInfoModel | null;
  conflictingAddins: AddinModel[];
}

interface ConflictingProjectsState {
  // The addin file info that the user is trying to publish
  conflictingProjectInfo: ConflictingProjectInfo;
  getConflictingProjects: () => Promise<ConflictingProjectInfo>;
  resolvedConflict: boolean;
  setResolvedConflict: (resolvedConflict: boolean) => void;
}

export const useConflictingProjectsState = create<ConflictingProjectsState>(
  (set, get) => ({
    conflictingProjectInfo: { addin: null, conflictingAddins: [] },
    getConflictingProjects: async () => {
      const { addinFileInfo } = useLocalAddinExporterStore.getState();
      const { existingAddinsInRegistry } = useAddinValidationStore.getState();
      const existingAddins = await existingAddinsInRegistry();
      set({
        conflictingProjectInfo: {
          addin: addinFileInfo,
          conflictingAddins: existingAddins,
        },
      });
      return get().conflictingProjectInfo;
    },
    resolvedConflict: false,
    setResolvedConflict: (resolvedConflict: boolean) => {
      set({ resolvedConflict });
    },
  })
);
