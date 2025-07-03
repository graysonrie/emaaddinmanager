"use client";

import OpenProjectDropZone from "./OpenProjectDropZone";
import AddinInfoForm from "./AddinInfoForm";
import { useState } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import SelectDestinationForm from "./SelectDestinationForm";
import { Button } from "@/components/ui/button";
import { CategoryModel } from "@/lib/models/category.model";
import { useLocalAddinExporterStore } from "@/lib/local-addins/store/useLocalAddinExporterStore";
import Processing from "./load-pages/Processing";
import ResultsPopup from "./results-popup";
import { ErrorList } from "@/types/error-list";
import { useSidebarStore } from "../sidebar/store";
import useFileSelect from "./hooks/useFileSelect";
import PageWrapper from "@/components/PageWrapper";

export default function PublishPage() {
  const { categories } = useAddinRegistry();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] =
    useState("Building addin...");
  const [isResultsPopupOpen, setIsResultsPopupOpen] = useState(false);

  // Results popup state
  const [resultsPopupTitle, setResultsPopupTitle] = useState("Title");
  const [resultsPopupMessage, setResultsPopupMessage] = useState("Message");
  const [buildResult, setBuildResult] = useState("Build Result");
  const [errorsList, setErrorsList] = useState<ErrorList | undefined>({
    errors: ["Error 1", "Error 2", "Error 3"],
    warnings: ["Warning 1", "Warning 2", "Warning 3"],
  });
  const { setIsOpen } = useSidebarStore();

  const [destinationCategory, setDestinationCategory] =
    useState<CategoryModel | null>(null);
  const {
    projectDir,
    setProjectDir,
    exportAddin,
    refresh,
    buildAddin,
    addinFileInfo,
    setAddinFileInfo,
    dlls,
    loading,
    error,
    getAllProjectDlls,
    setDlls,
  } = useLocalAddinExporterStore();

  const handleInitialProjectSelected = async (projectDir: string) => {
    setProjectDir(projectDir);
    const projectDlls = await getAllProjectDlls();
    const requiredDllNames = ["RealRevitPlugin"];
    const foundDlls = projectDlls.filter((dll) =>
      requiredDllNames.includes(dll.name)
    );
    console.log("foundDlls", foundDlls);
    if (foundDlls.length !== requiredDllNames.length) {
      console.error("Required DLLs not found in project");
    }
    setDlls(foundDlls);
    refresh();
  };
  const { handleFileSelect, isProcessing: isFileSelectProcessing } =
    useFileSelect(handleInitialProjectSelected);

  const handlePublish = async () => {
    if (!addinFileInfo || !destinationCategory || !projectDir) {
      return;
    }
    setIsOpen(false);
    setIsProcessing(true);
    setProcessingMessage("Building addin...");
    const buildResult = await buildAddin();
    setProcessingMessage("Exporting addin...");

    const errorsList = await exportAddin(
      addinFileInfo,
      dlls.map((dll) => dll.name),
      destinationCategory.fullPath
    );
    setIsProcessing(false);
    setIsResultsPopupOpen(true);
    setBuildResult(buildResult);
    setIsOpen(true);
    setErrorsList(
      errorsList.errors.length > 0 || errorsList.warnings.length > 0
        ? errorsList
        : undefined
    );
    if (errorsList.errors.length > 0) {
      setResultsPopupTitle("Publish Failed");
      setResultsPopupMessage("There were errors during the publish process.");
    } else if (errorsList.warnings.length > 0) {
      setResultsPopupTitle("Publish Results");
      setResultsPopupMessage("Addin published successfully with warnings.");
    } else {
      setResultsPopupTitle("Publish Results");
      setResultsPopupMessage("Addin published successfully.");
    }
    // Reset the store
    resetStore();
  };

  const resetStore = () => {
    setProjectDir(null);
    setAddinFileInfo(null);
    setDlls([]);
  };

  const isAllAddinInfoFilled = () => {
    if (!addinFileInfo) {
      return false;
    }
    return (
      addinFileInfo.name &&
      addinFileInfo.description &&
      addinFileInfo.vendorId &&
      addinFileInfo.email
    );
  };

  const isPublishButtonDisabled =
    !addinFileInfo || !destinationCategory || !isAllAddinInfoFilled();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full">
        {isProcessing ? (
          <Processing message={processingMessage} />
        ) : projectDir ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 w-full max-w-4xl p-2">
            <h1 className="text-2xl font-bold">Publish Addin</h1>
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
                Publish
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
            <h1 className="text-2xl font-bold">Publish Addin</h1>

            <OpenProjectDropZone
              onProjectSelected={handleInitialProjectSelected}
            />
          </div>
        )}
        <ResultsPopup
          isOpen={isResultsPopupOpen}
          setIsOpen={setIsResultsPopupOpen}
          title={resultsPopupTitle}
          message={resultsPopupMessage}
          buildResult={buildResult}
          errorsList={errorsList}
        />
      </div>
    </PageWrapper>
  );
}
