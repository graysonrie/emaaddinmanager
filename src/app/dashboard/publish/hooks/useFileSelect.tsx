import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";

export default function useFileSelect(
  onProjectSelected: (projectDir: string) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileSelect = useCallback(async () => {
    try {
      setIsProcessing(true);
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "C# Project Files",
            extensions: ["csproj"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        // Get the parent directory of the selected .csproj file
        const projectDir = selected.substring(0, selected.lastIndexOf("\\"));
        onProjectSelected?.(projectDir);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [onProjectSelected]);

  return { handleFileSelect, isProcessing };
}
