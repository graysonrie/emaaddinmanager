"use client";
import { Input } from "@/components/ui/input";
import { Folder } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { open } from "@tauri-apps/plugin-dialog";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import { useAsync } from "react-use";

export default function ChangeRegistryPath() {
  useConfig();

  const { localRegistryPath, changeRegistryPath } = useAddinRegistryStore();

  const loadedRegistryPath = useAsync(async () => {
    const path = await localRegistryPath;
    return path;
  }, [localRegistryPath]);

  const handleRegistryInputClicked = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a directory",
    });
    if (selected) {
      changeRegistryPath(selected as string);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Folder className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Local Addin Registry</h3>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 w-full">
            <p className="font-medium">Registry Path</p>
            <p className="text-sm text-muted-foreground">
              Configure the local addin registry path
            </p>
            <Input
              value={loadedRegistryPath.value || ""}
              className="w-full mt-4"
              readOnly={true}
              onClick={handleRegistryInputClicked}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
