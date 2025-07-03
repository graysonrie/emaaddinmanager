"use client";

import { useState, useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FolderOpen } from "lucide-react";
import useFileSelect from "./hooks/useFileSelect";

interface Props {
  onProjectSelected: (projectDir: string) => void;
}

export default function OpenProjectDropZone({ onProjectSelected }: Props) {
  const { handleFileSelect, isProcessing } = useFileSelect(onProjectSelected);

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
