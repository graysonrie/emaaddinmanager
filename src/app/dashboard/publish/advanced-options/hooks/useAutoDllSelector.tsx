import { useEffect, useState } from "react";
import { SelectedDllModel } from "../useAdvancedOptionsPopupStore";
import { useLocalAddinExporterStore } from "@/app/dashboard/publish/stores/useLocalAddinExporterStore";

export default function useAutoDllSelector() {
  const [autoSelectedDlls, setAutoSelectedDlls] = useState<SelectedDllModel[]>(
    []
  );
  const { projectDir, getAllProjectDlls } = useLocalAddinExporterStore();

  useEffect(() => {
    const getDlls = async () => {
      if (!projectDir) return;
      const dlls = await getAllProjectDlls();
      const requiredDlls = ["RealRevitPlugin"];
      const selectedDlls = dlls.filter((dll) =>
        requiredDlls.includes(dll.name)
      );
      setAutoSelectedDlls(
        selectedDlls.map((dll) => ({ dll, canBeUntoggled: false }))
      );
    };
    getDlls();
  }, [projectDir]);

  return { autoSelectedDlls };
}
