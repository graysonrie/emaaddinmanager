import { create } from "zustand";
import {
  SimplifiedAddinInfoModel,
  getEmptySimplifiedAddinInfo,
} from "@/lib/models/simplified-addin-info.model";
import { DllModel } from "@/lib/models/dll.model";
import { CategoryModel } from "@/lib/models/category.model";

interface PublishStore {
  projectDir: string | null;
  addinFileInfo: SimplifiedAddinInfoModel;
  dlls: DllModel[];
  categories: CategoryModel[];
  destinationCategory: CategoryModel | null;
  setProjectDir: (projectDir: string) => void;
  setAddinFileInfo: (info: SimplifiedAddinInfoModel) => void;
  setDlls: (dlls: DllModel[]) => void;
  setCategories: (categories: CategoryModel[]) => void;
  setDestinationCategory: (category: CategoryModel | null) => void;
}

export const usePublishStore = create<PublishStore>((set) => ({
  projectDir: null,
  addinFileInfo: getEmptySimplifiedAddinInfo(),
  dlls: [],
  categories: [],
  destinationCategory: null,
  setProjectDir: (projectDir: string) => set({ projectDir }),
  setAddinFileInfo: (addinFileInfo: SimplifiedAddinInfoModel) =>
    set({ addinFileInfo }),
  setDlls: (dlls: DllModel[]) => set({ dlls }),
  setCategories: (categories: CategoryModel[]) => set({ categories }),
  setDestinationCategory: (category: CategoryModel | null) =>
    set({ destinationCategory: category }),
}));
