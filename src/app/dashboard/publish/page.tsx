"use client";

import useLocalAddinExporter from "@/lib/local-addins/useLocalAddinExporter";
import OpenProjectDropZone from "./OpenProjectDropZone";
import AddinInfoForm from "./AddinInfoForm";
import { usePublishStore } from "./store";
import { useEffect } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import SelectDestinationForm from "./SelectDestinationForm";
import { Button } from "@/components/ui/button";

export default function PublishPage() {
  const { categories } = useAddinRegistry();
  const {
    projectDir,
    exportAddin,
    refresh,
    buildAddin,
    addinFileInfo,
    setAddinFileInfo,
    dlls,
    loading,
    error,
  } = useLocalAddinExporter();

  const {
    projectDir: publishProjectDir,
    setProjectDir: setPublishProjectDir,
    addinFileInfo: publishAddinFileInfo,
    setAddinFileInfo: setPublishAddinFileInfo,
    setDlls: setPublishDlls,
    categories: publishCategories,
    setCategories: setPublishCategories,
    destinationCategory: publishDestinationCategory,
  } = usePublishStore();

  const handleInitialProjectSelected = (projectDir: string) => {
    refresh(projectDir);
  };

  useEffect(() => {
    if (projectDir) {
      setPublishProjectDir(projectDir);
    }
  }, [projectDir, setPublishProjectDir]);

  // Update store when addin file info changes
  useEffect(() => {
    if (addinFileInfo) {
      setPublishAddinFileInfo(addinFileInfo);
    }
  }, [addinFileInfo, setPublishAddinFileInfo]);

  // Update store when DLLs change
  useEffect(() => {
    if (dlls && dlls.length > 0) {
      setPublishDlls(dlls);
    }
  }, [dlls, setPublishDlls]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setPublishCategories(categories);
    }
  }, [categories, setPublishCategories]);

  const isPublishButtonDisabled =
    !publishDestinationCategory || !publishAddinFileInfo;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {publishProjectDir ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 w-full max-w-4xl p-2">
          <h1 className="text-2xl font-bold">Publish Addin</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-y-auto">
            <AddinInfoForm />
            <SelectDestinationForm />
          </div>
          <div className=" flex justify-center w-full pb-3">
            <Button
              className="w-1/2"
              variant={isPublishButtonDisabled ? "outline" : "default"}
              disabled={isPublishButtonDisabled}
            >
              Publish
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
    </div>
  );
}
