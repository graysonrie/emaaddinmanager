import { create } from "zustand";

import { AddinModel } from "@/lib/models/addin.model";

interface LibraryState {
    selectedAddin: AddinModel | null;
    setSelectedAddin: (addin: AddinModel | null) => void;
    installingAddins: AddinModel[];
    setInstallingAddins: (addins: AddinModel[]) => void;
    failedToUninstallAddin: boolean;
    setFailedToUninstallAddin: (failed: boolean) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
    selectedAddin: null,
    setSelectedAddin: (addin: AddinModel | null) => set({ selectedAddin: addin }),
    installingAddins: [],
    setInstallingAddins: (addins: AddinModel[]) => set({ installingAddins: addins }),
    failedToUninstallAddin: false,
    setFailedToUninstallAddin: (failed: boolean) => set({ failedToUninstallAddin: failed }),
}));