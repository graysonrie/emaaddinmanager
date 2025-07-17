"use client";
import PageWrapper from "@/components/PageWrapper";
import { useConflictingProjectsState } from "../stores/useConflictingProjectsState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpenIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AddinModel } from "@/lib/models/addin.model";
import { usePublishDestinationStore } from "../stores/usePublishDestinationStore";
import { getCategoryFromAddin } from "@/lib/utils";

export default function ConflictPage() {
  const { conflictingProjectInfo } = useConflictingProjectsState();
  const router = useRouter();
  const { setDestinationCategory } = usePublishDestinationStore();

  const getAddinDisplayName = () => {
    return conflictingProjectInfo.addin?.csharpProjectName;
  };

  useEffect(() => {
    if (!conflictingProjectInfo.addin) {
      router.push("/dashboard/publish");
    }
  }, [conflictingProjectInfo.addin, router]);

  const handleSelectExistingProject = (addin: AddinModel) => {
    const category = getCategoryFromAddin(addin);
    setDestinationCategory(category);
    router.push("/dashboard/publish/workspace");
  };

  const handleCreateNewProject = () => {
    router.push("/dashboard/publish/workspace");
  };

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full p-2 w-full box-border">
        <div className="flex flex-col items-center justify-center gap-2 max-w-md text-center w-full">
          <h1 className="text-xl font-sans font-bold">
            An addin with the name {getAddinDisplayName()} already exists.
          </h1>
          <div className="flex flex-col  justify-center gap-4">
            <div className="flex flex-col gap-2 items-center">
              <p className="text-sm font-sans">
                Select an existing project to update:
              </p>
              <Card className="p-4 w-full">
                <h2 className="text-sm font-sans">
                  {conflictingProjectInfo.conflictingAddins.map((addin) => (
                    <div key={addin.pathToAddinDllFolder}>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSelectExistingProject(addin)}
                      >
                        <FolderOpenIcon />
                        {addin.pathToAddinDllFolder}
                      </Button>
                    </div>
                  ))}
                </h2>
              </Card>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <p className="text-sm font-sans">Or create a new project:</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateNewProject}
              >
                <PlusIcon />
                Create a new project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
