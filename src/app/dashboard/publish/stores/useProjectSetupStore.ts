import { create } from "zustand";
import { useLocalAddinExporterStore } from "@/lib/local-addins/useLocalAddinExporterStore";

interface ProjectSetupStore {
  projectDir: string | null;
  handleInitialProjectSelected: (projectDir: string) => Promise<void>;
  resetProject: () => void;
}

export const useProjectSetupStore = create<ProjectSetupStore>((set, get) => ({
  projectDir: null,

  handleInitialProjectSelected: async (projectDir: string) => {
    const { setProjectDir, getAllProjectDlls, setDlls, refresh } =
      useLocalAddinExporterStore.getState();

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

    set({ projectDir });
  },

  resetProject: () => {
    const { setProjectDir, setDlls } = useLocalAddinExporterStore.getState();
    setProjectDir(null);
    setDlls([]);
    set({ projectDir: null });
  },
}));
