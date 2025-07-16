import { create } from "zustand";
import { CategoryModel } from "@/lib/models/category.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useLocalAddinExporterStore } from "@/app/dashboard/publish/stores/useLocalAddinExporterStore";
import { ErrorList } from "@/types/error-list";
import { useAdvancedOptionsPopupStore } from "../advanced-options/useAdvancedOptionsPopupStore";
import { usePublishStateStore } from "./usePublishStateStore";

interface PublishActionsStore {
  handlePublish: (destinationCategory: CategoryModel | null) => Promise<void>;
}

export const usePublishActionsStore = create<PublishActionsStore>(
  (set, get) => ({
    handlePublish: async (destinationCategory: CategoryModel | null) => {
      const { exportAddin, buildAddin, addinFileInfo } =
        useLocalAddinExporterStore.getState();
      const { selectedProjectDlls } = useAdvancedOptionsPopupStore.getState();
      const { startProcessing, stopProcessing, showResults } =
        usePublishStateStore.getState();

      if (!addinFileInfo || !destinationCategory) {
        return;
      }

      const errorsList: ErrorList = { errors: [], warnings: [] };

      startProcessing("Building addin...");
      let buildResult: string =
        "Failed to build addin. Please open your C# file and ensure there are no errors.";
      try {
        buildResult = await buildAddin();

        // Only export if build was successful
        startProcessing("Exporting addin...");

        const exportErrorsList = await exportAddin(
          addinFileInfo,
          selectedProjectDlls.map((dll) => dll.dll.name),
          destinationCategory.fullPath
        );

        errorsList.errors = [...errorsList.errors, ...exportErrorsList.errors];
        errorsList.warnings = [
          ...errorsList.warnings,
          ...exportErrorsList.warnings,
        ];
      } catch (error) {
        errorsList.errors.push("Failed to build addin");
      }

      stopProcessing();

      // Determine result message
      let title: string;
      let message: string;

      if (errorsList.errors.length > 0) {
        title = "Publish Failed";
        message = "There were errors during the publish process.";
      } else if (errorsList.warnings.length > 0) {
        title = "Publish Results";
        message = "Addin published successfully with warnings.";
      } else {
        title = "Publish Results";
        message = "Addin published successfully.";
      }

      showResults(title, message, buildResult, errorsList);

      // Reset the local addin exporter store
      const { reset } = useLocalAddinExporterStore.getState();
      reset();
    },
  })
);
