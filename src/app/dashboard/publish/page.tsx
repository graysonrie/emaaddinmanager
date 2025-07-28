"use client";

import OpenProjectDropZone from "./OpenProjectDropZone";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalAddinExporterStore } from "@/app/dashboard/publish/stores/useLocalAddinExporterStore";
import ResultsPopup from "./results-popup";
import PageWrapper from "@/components/PageWrapper";
import { usePublishStateStore } from "./stores";
import { useConflictingProjectsState } from "./stores/useConflictingProjectsState";

export default function PublishPage() {
  const router = useRouter();
  // Zustand stores
  const { projectDir, addinFileInfo } = useLocalAddinExporterStore();
  const localAddinExporter = useLocalAddinExporterStore();
  const { getConflictingProjects } = useConflictingProjectsState();

  const publishState = usePublishStateStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const checkConflictingProjects = async () => {
      if (!projectDir || !addinFileInfo) {
        return;
      }
      const conflictingProjectInfo = await getConflictingProjects();
      if (conflictingProjectInfo.conflictingAddins.length > 0) {
        router.push("/dashboard/publish/conflict");
      } else {
        router.push("/dashboard/publish/workspace");
      }
      setLoading(false);
    };
    checkConflictingProjects();
  }, [projectDir, addinFileInfo, getConflictingProjects, router]);

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h1 className="text-2xl font-bold">Publish Addin</h1>

          <OpenProjectDropZone
            onProjectSelected={localAddinExporter.handleProjectSelected}
          />
        </div>
      </div>
      <ResultsPopup
        isOpen={publishState.isResultsPopupOpen}
        setIsOpen={publishState.closeResults}
        title={publishState.resultsPopupTitle}
        message={publishState.resultsPopupMessage}
        buildResult={publishState.buildResult}
        errorsList={publishState.errorsList}
      />
    </PageWrapper>
  );
}
