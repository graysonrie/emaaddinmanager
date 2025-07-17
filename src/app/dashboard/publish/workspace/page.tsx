"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalAddinExporterStore } from "../stores/useLocalAddinExporterStore";
import { useAddinValidationStore } from "../stores/useAddinValidationStore";
import Workspace from "./index";
import PageWrapper from "@/components/PageWrapper";
import { usePublishDestinationStore } from "../stores/usePublishDestinationStore";
import { usePublishStateStore } from "../stores";
import Processing from "../load-pages/Processing";
import ResultsPopup from "../results-popup";

export default function WorkspacePage() {
  const router = useRouter();
  const { projectDir } = useLocalAddinExporterStore();
  const publishState = usePublishStateStore();

  // Redirect to publish page if no project is selected
  useEffect(() => {
    if (!projectDir) {
      router.push("/dashboard/publish");
    }
  }, [projectDir, router]);

  // Show loading or redirect if no project
  if (!projectDir) {
    return null; // Will redirect
  }

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-full gap-4 w-full p-2">
        {publishState.isProcessing ? (
          <Processing message={publishState.processingMessage} />
        ) : (
          <Workspace />
        )}
      </div>

    </PageWrapper>
  );
}
