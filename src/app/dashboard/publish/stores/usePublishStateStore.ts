import { create } from "zustand";
import { ErrorList } from "@/types/error-list";
import { useSidebarStore } from "../../components/sidebar/store";

interface PublishStateStore {
  // State
  isProcessing: boolean;
  processingMessage: string;
  isResultsPopupOpen: boolean;
  resultsPopupTitle: string;
  resultsPopupMessage: string;
  buildResult: string;
  errorsList: ErrorList | undefined;

  // Actions
  startProcessing: (message?: string) => void;
  stopProcessing: () => void;
  showResults: (
    title: string,
    message: string,
    buildResult: string,
    errorsList?: ErrorList
  ) => void;
  closeResults: () => void;
  setProcessingMessage: (message: string) => void;
}

export const usePublishStateStore = create<PublishStateStore>((set) => ({
  // Initial state
  isProcessing: false,
  processingMessage: "Building addin...",
  isResultsPopupOpen: false,
  resultsPopupTitle: "Title",
  resultsPopupMessage: "Message",
  buildResult: "Build Result",
  errorsList: {
    errors: ["Error 1", "Error 2", "Error 3"],
    warnings: ["Warning 1", "Warning 2", "Warning 3"],
  },

  // Actions
  startProcessing: (message: string = "Building addin...") => {
    const { setIsOpen } = useSidebarStore.getState();
    setIsOpen(false);
    set({ isProcessing: true, processingMessage: message });
  },

  stopProcessing: () => {
    const { setIsOpen } = useSidebarStore.getState();
    set({ isProcessing: false });
    setIsOpen(true);
  },

  showResults: (
    title: string,
    message: string,
    buildResult: string,
    errorsList?: ErrorList
  ) => {
    set({
      isResultsPopupOpen: true,
      resultsPopupTitle: title,
      resultsPopupMessage: message,
      buildResult: buildResult,
      errorsList:
        errorsList &&
        (errorsList.errors.length > 0 || errorsList.warnings.length > 0)
          ? errorsList
          : undefined,
    });
  },

  closeResults: () => {
    set({ isResultsPopupOpen: false });
  },

  setProcessingMessage: (message: string) => {
    set({ processingMessage: message });
  },
}));
