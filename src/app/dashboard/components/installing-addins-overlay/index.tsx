"use client";

import { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AddinInstallProgressEvent {
  progress: number;
  addinName: string;
  description: string;
}

interface AddinInstallation {
  id: string;
  progress: number;
  addinName: string;
  description: string;
  timestamp: number;
}

export default function InstallingAddinsOverlay() {
  const [installations, setInstallations] = useState<AddinInstallation[]>([]);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<AddinInstallProgressEvent>(
          "addin_install_progress",
          (event) => {
            const { progress, addinName, description } = event.payload;

            console.warn("Received progress event:", event.payload);

            setInstallations((prev) => {
              // Check if this addin is already being tracked
              const existingIndex = prev.findIndex(
                (installation) => installation.addinName === addinName
              );

              if (existingIndex >= 0) {
                // Update existing installation
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  progress,
                  description,
                  timestamp: Date.now(),
                };

                // Remove if progress is 100%
                if (progress >= 100) {
                  return updated.filter((_, index) => index !== existingIndex);
                }

                return updated;
              } else {
                // Add new installation
                const newInstallation: AddinInstallation = {
                  id: `${addinName}-${Date.now()}`,
                  progress,
                  addinName,
                  description,
                  timestamp: Date.now(),
                };

                return [...prev, newInstallation];
              }
            });
          }
        );
      } catch (error) {
        console.error(
          "Failed to set up addin install progress listener:",
          error
        );
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  // Auto-remove installations that are older than 5 seconds and completed
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setInstallations((prev) =>
        prev.filter(
          (installation) =>
            !(
              installation.progress >= 100 &&
              now - installation.timestamp > 5000
            )
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (installations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-3 max-w-sm">
      {installations.map((installation) => (
        <Card
          key={installation.id}
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {installation.addinName}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {installation.progress}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3">
              {installation.description}
            </p>
            <Progress value={installation.progress} className="h-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
