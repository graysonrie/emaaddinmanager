import { useCallback } from "react";
import { useLocalAddinExporterStore } from "@/lib/local-addins/useLocalAddinExporterStore";

export default function useProjectSetup() {
  const { projectDir, setProjectDir, refresh, getAllProjectDlls, setDlls } =
    useLocalAddinExporterStore();

  const handleInitialProjectSelected = useCallback(
    async (projectDir: string) => {
      setProjectDir(projectDir);
      const projectDlls = await getAllProjectDlls();

      // TODO: Ensure that the user can change the project dlls
      const requiredDllNames = ["RealRevitPlugin"];
      const foundDlls = projectDlls.filter((dll) =>
        requiredDllNames.includes(dll.name)
      );
      console.log("foundDlls", foundDlls);
      if (foundDlls.length !== requiredDllNames.length) {
        console.warn("Required DLLs not found in project");
      }
      setDlls(foundDlls);
      refresh();
    },
    [setProjectDir, getAllProjectDlls, setDlls, refresh]
  );

  const resetProject = useCallback(() => {
    setProjectDir(null);
    setDlls([]);
  }, [setProjectDir, setDlls]);

  return {
    projectDir,
    handleInitialProjectSelected,
    resetProject,
  };
}
