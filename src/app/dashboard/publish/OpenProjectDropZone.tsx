"use client";

import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";
import { usePublishStore } from "./store";

interface Props {
  onProjectSelected?: (projectDir: string) => void;
}

export default function OpenProjectDropZone({ onProjectSelected }: Props) {
  const { projectDir, setProjectDir } = usePublishStore();
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
        setProjectDir(projectDir);
        onProjectSelected?.(projectDir);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [setProjectDir]);

  return (
    <Card
      className={`
        relative p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
        border-muted-foreground/25 hover:border-primary/50
        
        ${isProcessing ? "opacity-50 pointer-events-none" : ""}
      `}
      onClick={handleFileSelect}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center space-x-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Select a .csproj file</h3>
          <p className="text-sm text-muted-foreground">
            Open up a C# project file (.csproj) to get started
          </p>
        </div>

        <Button variant="outline" className="mt-4">
          Browse Files
        </Button>
      </div>
    </Card>
  );
}
