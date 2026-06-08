"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDevToolsStore } from "./store";

export default function DevToolsContent() {
  const { isRegenerating, regenerateZipFiles } = useDevToolsStore();

  return (
    <div className="text-center py-12">
      <div className="text-muted-foreground">
        <p className="text-lg font-medium">Development Tools</p>
        <div>
          {isRegenerating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Regenerating zip files in registry...</p>
            </div>
          ) : (
            <Button onClick={regenerateZipFiles}>
              Regenerate Zip Files in Registry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
