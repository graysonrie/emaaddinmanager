import { CategoryModel } from "@/lib/models/category.model";
import { create } from "zustand";

interface PublishDestinationStore {
  destinationCategory: CategoryModel | null;
  setDestinationCategory: (category: CategoryModel | null) => void;
}

export const usePublishDestinationStore = create<PublishDestinationStore>(
  (set) => ({
    destinationCategory: null,
    setDestinationCategory: (category: CategoryModel | null) =>
      set({ destinationCategory: category }),
  })
);
