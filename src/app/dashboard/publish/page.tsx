"use client";

import OpenProjectDropZone from "./OpenProjectDropZone";
import AddinInfoForm from "./AddinInfoForm";
import { useEffect, useState } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import SelectDestinationForm from "./SelectDestinationForm";
import { Button } from "@/components/ui/button";
import { CategoryModel } from "@/lib/models/category.model";
import { useLocalAddinExporterStore } from "@/lib/local-addins/useLocalAddinExporterStore";
import Processing from "./load-pages/Processing";
import ResultsPopup from "./results-popup";
import PageWrapper from "@/components/PageWrapper";
import {
  useFileSelect,
  usePublishState,
  useAddinValidation,
  useProjectSetup,
  usePublishActions,
} from "./hooks";
import { getFileNameFromPath } from "@/lib/utils";
import { useAdvancedOptionsPopupStore } from "./advanced-options/useAdvancedOptionsPopupStore";
import { Settings } from "lucide-react";
import AdvancedOptionsPopup from "./advanced-options";

export default function PublishPage() {
  const [pageTitle, setPageTitle] = useState("Publish Addin");
  const { categories } = useAddinRegistry();
  const [destinationCategory, setDestinationCategory] =
    useState<CategoryModel | null>(null);

  const advancedOptionsPopupStore = useAdvancedOptionsPopupStore();

  // Custom hooks
  const publishState = usePublishState();
  const { addinFileInfo, setAddinFileInfo } = useLocalAddinExporterStore();
  const addinValidation = useAddinValidation(addinFileInfo);
  const projectSetup = useProjectSetup();
  const { handleFileSelect, isProcessing: isFileSelectProcessing } =
    useFileSelect(projectSetup.handleInitialProjectSelected);

  const publishActions = usePublishActions({
    onStartProcessing: publishState.startProcessing,
    onStopProcessing: publishState.stopProcessing,
    onShowResults: publishState.showResults,
    onResetStore: () => {
      projectSetup.resetProject();
      setAddinFileInfo(null);
    },
  });

  const handlePublish = () => {
    publishActions.handlePublish(destinationCategory);
  };

  const isPublishButtonDisabled =
    !addinFileInfo ||
    !destinationCategory ||
    !addinValidation.isAllAddinInfoFilled();

  useEffect(() => {
    const addinExistsInRegistry = addinValidation.existingAddinsInRegistry();
    if (addinExistsInRegistry) {
      setPageTitle("Update Addin");
    } else {
      setPageTitle("Publish Addin");
    }
  }, [addinFileInfo, addinValidation.existingAddinsInRegistry]);

  useEffect(() => {
    const overrideDestinationPath = addinValidation.overrideDestinationPath;
    if (overrideDestinationPath) {
      const name = getFileNameFromPath(overrideDestinationPath);
      if (!name) {
        console.warn("Could not get name from path", overrideDestinationPath);
        return;
      }
      setDestinationCategory({
        name,
        fullPath: overrideDestinationPath,
      });
    }
  }, [addinValidation.overrideDestinationPath]);

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full">
        {publishState.isProcessing ? (
          <Processing message={publishState.processingMessage} />
        ) : projectSetup.projectDir ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 w-full max-w-4xl p-2">
            <div className="flex justify-center w-full gap-2">
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
              <Button
                variant="ghost"
                onClick={() => advancedOptionsPopupStore.setIsOpen(true)}
                title="Advanced Options"
                className="w-8 h-8 "
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-y-auto">
              {addinFileInfo && (
                <AddinInfoForm
                  addinFileInfo={addinFileInfo}
                  onAddinFileInfoChange={setAddinFileInfo}
                />
              )}
              <SelectDestinationForm
                categories={categories}
                setDestinationCategory={setDestinationCategory}
                overrideDestinationPath={
                  addinValidation.overrideDestinationPath
                }
              />
            </div>
            <label className="text-sm text-muted-foreground">
              {destinationCategory ? (
                <>
                  Publishing to{" "}
                  <span className="font-bold">{destinationCategory.name}</span>
                </>
              ) : (
                ""
              )}
            </label>
            <div className=" flex justify-center w-1/2 pb-3 gap-4 flex-col">
              <Button
                className="w-full"
                variant={isPublishButtonDisabled ? "outline" : "default"}
                disabled={isPublishButtonDisabled}
                onClick={handlePublish}
              >
                {addinValidation.existingAddinsInRegistry()
                  ? "Update"
                  : "Publish"}
              </Button>
              <Button
                className="w-full p-0 m-0 text-xs text-muted-foreground"
                variant="link"
                disabled={isFileSelectProcessing}
                onClick={handleFileSelect}
              >
                Select a different project
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>

            <OpenProjectDropZone
              onProjectSelected={projectSetup.handleInitialProjectSelected}
            />
          </div>
        )}
        <ResultsPopup
          isOpen={publishState.isResultsPopupOpen}
          setIsOpen={publishState.closeResults}
          title={publishState.resultsPopupTitle}
          message={publishState.resultsPopupMessage}
          buildResult={publishState.buildResult}
          errorsList={publishState.errorsList}
        />
        <AdvancedOptionsPopup />
      </div>
    </PageWrapper>
  );
}
