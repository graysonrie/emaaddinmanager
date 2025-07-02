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

export default function PublishPage() {
  const { categories } = useAddinRegistry();
  const [isProcessing, setIsProcessing] = useState(false);
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
  } = useLocalAddinExporterStore();

  const handleInitialProjectSelected = (projectDir: string) => {
    refresh(projectDir);
    setProjectDir(projectDir);
  };

  const handlePublish = () => {
    if (!addinFileInfo || !destinationCategory || !projectDir) {
      return;
    }
    setIsProcessing(true);
    // buildAddin(projectDir);
    // exportAddin(
    //   projectDir,
    //   addinFileInfo,
    //   dlls.map((dll) => dll.fullPath),
    //   destinationCategory.fullPath
    // );
    setIsProcessing(false); 
  };

  const isAllAddinInfoFilled = ()=>{
    if(!addinFileInfo){
      return false;
    }
    return (
      addinFileInfo.name &&
      addinFileInfo.description &&
      addinFileInfo.vendorId &&
      addinFileInfo.email
    );
  };

  const isPublishButtonDisabled = !addinFileInfo || !destinationCategory || !isAllAddinInfoFilled();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {isProcessing ? (
        <Processing message="Building addin..." />
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
              "Select a destination category"
            )}
          </label>
          <div className=" flex justify-center w-full pb-3">
            <Button
              className="w-1/2"
              variant={isPublishButtonDisabled ? "outline" : "default"}
              disabled={isPublishButtonDisabled}
              onClick={handlePublish}
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
