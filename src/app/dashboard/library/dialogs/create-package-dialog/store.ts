import { CreateAddinPackageRequestModel } from "@/lib/models/create-addin-package-request.model";
import { AddinPackageInfoModel } from "@/lib/models/addin-package-info.model";
import { create, useStore } from "zustand";

interface CreatePackageDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  pendingRequest: CreateAddinPackageRequestModel | null;
  setPendingRequest: (request: CreateAddinPackageRequestModel | null) => void;
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  existingPackage: AddinPackageInfoModel | null;
  setExistingPackage: (existingPackage: AddinPackageInfoModel | null) => void;
}

export const useCreatePackageDialogStore = create<CreatePackageDialogStore>(
  (set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    pendingRequest: null,
    setPendingRequest: (request) => set({ pendingRequest: request }),
    isEditMode: false,
    setIsEditMode: (isEditMode) => set({ isEditMode }),
    existingPackage: null,
    setExistingPackage: (existingPackage) => set({ existingPackage }),
  })
);
