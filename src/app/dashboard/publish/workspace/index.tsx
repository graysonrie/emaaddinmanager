"use client";

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import AddinInfoForm from "./AddinInfoForm";
import SelectDestinationForm from "./SelectDestinationForm";
import { useState } from "react";
import { useAdvancedOptionsPopupStore } from "../advanced-options/useAdvancedOptionsPopupStore";
import { usePublishActionsStore } from "../stores";
import { useLocalAddinExporterStore } from "../stores/useLocalAddinExporterStore";
import { useAddinValidationStore } from "../stores/useAddinValidationStore";
import { usePublishDestinationStore } from "../stores/usePublishDestinationStore";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import { useAsync } from "react-use";
import AdvancedOptionsPopup from "../advanced-options";
import ReplacementDllsSection from "../replacement-dlls";

export default function Workspace() {
  const [pageTitle] = useState("Publish Addin");
  const { categories } = useAddinRegistryStore();
  const { destinationCategory } = usePublishDestinationStore();

  const advancedOptionsPopupStore = useAdvancedOptionsPopupStore();

  // Zustand stores
  const { addinFileInfo, setAddinFileInfo } = useLocalAddinExporterStore();
  const addinValidation = useAddinValidationStore();
  const publishActions = usePublishActionsStore();

  const handlePublish = () => {
    publishActions.handlePublish(destinationCategory);
  };

  const isTryingToPublishExistingAddin =
    useAsync(
      async () => await addinValidation.isTryingToPublishExistingAddin(),
      [destinationCategory, addinFileInfo],
    ).value ?? false;

  const isPublishButtonDisabled =
    !addinFileInfo ||
    !destinationCategory ||
    !addinValidation.isAllAddinInfoFilled();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 w-full max-w-4xl p-2 flex-1">
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
        <SelectDestinationForm categories={categories} />
        <ReplacementDllsSection
          destinationPath={destinationCategory?.fullPath ?? null}
          addinName={addinFileInfo?.csharpProjectName || null}
        />
      </div>
      <label className="text-sm text-muted-foreground">
        {destinationCategory ? (
          <>
            {isTryingToPublishExistingAddin
              ? "Updating existing addin inside"
              : "Publishing to"}{" "}
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
          {isTryingToPublishExistingAddin ? "Update" : "Publish"}
        </Button>
      </div>

      <AdvancedOptionsPopup />
    </div>
  );
}
