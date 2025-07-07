import { useCallback } from "react";
import { CategoryModel } from "@/lib/models/category.model";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import { useLocalAddinExporterStore } from "@/lib/local-addins/useLocalAddinExporterStore";
import { ErrorList } from "@/types/error-list";

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
  const { exportAddin, buildAddin, addinFileInfo, setAddinFileInfo, dlls } =
    useLocalAddinExporterStore();

  const handlePublish = useCallback(
    async (destinationCategory: CategoryModel | null) => {
      if (!addinFileInfo || !destinationCategory) {
        return;
      }

      onStartProcessing("Building addin...");
      const buildResult = await buildAddin();
      onStartProcessing("Exporting addin...");

      const errorsList = await exportAddin(
        addinFileInfo,
        dlls.map((dll) => dll.name),
        destinationCategory.fullPath
      );

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
      dlls,
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
