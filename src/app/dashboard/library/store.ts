import { create } from "zustand";

import { AddinModel } from "@/lib/models/addin.model";

interface LibraryState {
    selectedAddin: AddinModel | null;
    setSelectedAddin: (addin: AddinModel | null) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
    selectedAddin: null,
    setSelectedAddin: (addin: AddinModel | null) => set({ selectedAddin: addin }),
}));