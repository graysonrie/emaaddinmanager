import { useState } from "react";
import { ErrorList } from "@/types/error-list";
import { useSidebarStore } from "../../sidebar/store";

export default function usePublishState() {
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

  const startProcessing = (message: string = "Building addin...") => {
    setIsOpen(false);
    setIsProcessing(true);
    setProcessingMessage(message);
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setIsOpen(true);
  };

  const showResults = (
    title: string,
    message: string,
    buildResult: string,
    errorsList?: ErrorList
  ) => {
    setIsResultsPopupOpen(true);
    setResultsPopupTitle(title);
    setResultsPopupMessage(message);
    setBuildResult(buildResult);
    setErrorsList(
      errorsList &&
        (errorsList.errors.length > 0 || errorsList.warnings.length > 0)
        ? errorsList
        : undefined
    );
  };

  const closeResults = () => {
    setIsResultsPopupOpen(false);
  };

  return {
    // State
    isProcessing,
    processingMessage,
    isResultsPopupOpen,
    resultsPopupTitle,
    resultsPopupMessage,
    buildResult,
    errorsList,

    // Actions
    startProcessing,
    stopProcessing,
    showResults,
    closeResults,
    setProcessingMessage,
  };
}
