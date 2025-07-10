import { useCallback } from "react";
import { CategoryModel } from "@/lib/models/category.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useLocalAddinExporterStore } from "@/lib/local-addins/useLocalAddinExporterStore";
import { ErrorList } from "@/types/error-list";
import { useAdvancedOptionsPopupStore } from "../advanced-options/useAdvancedOptionsPopupStore";

interface UsePublishActionsProps {
  onStartProcessing: (message: string) => void;
  onStopProcessing: () => void;
  onShowResults: (
    title: string,
    message: string,
    buildResult: string,
    errorsList?: ErrorList
  ) => void;
  onResetStore: () => void;
}

export default function usePublishActions({
  onStartProcessing,
  onStopProcessing,
  onShowResults,
  onResetStore,
}: UsePublishActionsProps) {
  const { exportAddin, buildAddin, addinFileInfo } =
    useLocalAddinExporterStore();

  const { selectedProjectDlls } = useAdvancedOptionsPopupStore();

  const handlePublish = useCallback(
    async (destinationCategory: CategoryModel | null) => {
      if (!addinFileInfo || !destinationCategory) {
        return;
      }

      const errorsList: ErrorList = { errors: [], warnings: [] };

      onStartProcessing("Building addin...");
      let buildResult: string =
        "Failed to build addin. Please open your C# file and ensure there are no errors.";
      try {
        buildResult = await buildAddin();

        // Only export if build was successful
        onStartProcessing("Exporting addin...");

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

      onStopProcessing();

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

      onShowResults(title, message, buildResult, errorsList);
      onResetStore();
    },
    [
      addinFileInfo,
      selectedProjectDlls,
      buildAddin,
      exportAddin,
      onStartProcessing,
      onStopProcessing,
      onShowResults,
      onResetStore,
    ]
  );

  return {
    handlePublish,
  };
}
