import { useAdvancedOptionsPopupStore } from "./useAdvancedOptionsPopupStore";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useLocalAddinExporterStore } from "@/app/dashboard/publish/stores/useLocalAddinExporterStore";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { DllModel } from "@/lib/models/dll.model";
import useAutoDllSelector from "./hooks/useAutoDllSelector";
import { Button } from "@/components/ui/button";
export default function AdvancedOptionsPopup() {
  const {
    isOpen,
    setIsOpen,
    setAvailableProjectDlls,
    availableProjectDlls,
    selectedProjectDlls,
    setSelectedProjectDlls,
  } = useAdvancedOptionsPopupStore();
  const { getAllProjectDlls, projectDir } = useLocalAddinExporterStore();
  const { autoSelectedDlls } = useAutoDllSelector();

  useEffect(() => {
    if (!projectDir) return;
    getAllProjectDlls().then((dlls) => {
      console.log("dlls", dlls);
      setAvailableProjectDlls(dlls);
    });
  }, [getAllProjectDlls, setAvailableProjectDlls, projectDir]);

  useEffect(() => {
    setSelectedProjectDlls(autoSelectedDlls);
  }, [autoSelectedDlls, setSelectedProjectDlls]);

  // Helper to check if a DLL is selected
  const isDllSelected = (dll: DllModel) =>
    selectedProjectDlls.some((d) => d.dll.name === dll.name);

  // Handler for checkbox change
  const handleDllToggle = (dll: DllModel) => {
    if (isDllSelected(dll)) {
      setSelectedProjectDlls(
        selectedProjectDlls.filter((d) => d.dll.name !== dll.name)
      );
    } else {
      setSelectedProjectDlls([
        ...selectedProjectDlls,
        { dll, canBeUntoggled: true },
      ]);
    }
  };

  const handleSelectAll = () => {
    setSelectedProjectDlls(
      availableProjectDlls.map((dll) => {
        // Check if this DLL is already selected with canBeUntoggled: false
        const existingSelection = selectedProjectDlls.find(
          (selected) => selected.dll.name === dll.name
        );

        // Preserve the existing canBeUntoggled state if it's false
        const canBeUntoggled = existingSelection?.canBeUntoggled ?? true;

        return { dll, canBeUntoggled };
      })
    );
  };

  const handleDeselectAll = () => {
    setSelectedProjectDlls(
      availableProjectDlls
        .map((dll) => {
          // Check if this DLL is already selected with canBeUntoggled: false
          const existingSelection = selectedProjectDlls.find(
            (selected) => selected.dll.name === dll.name
          );

          // Only include DLLs that have canBeUntoggled: false (required DLLs)
          if (existingSelection?.canBeUntoggled === false) {
            return { dll, canBeUntoggled: false };
          }

          // Exclude all other DLLs (deselect them)
          return null;
        })
        .filter(
          (item): item is { dll: any; canBeUntoggled: boolean } => item !== null
        )
    );
  };

  const dllsBrowser = () => {
    return (
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
        {availableProjectDlls.map((dll) => {
          // Find the selected DLL object (if any) to check canBeUntoggled
          const selected = selectedProjectDlls.find(
            (d) => d.dll.name === dll.name
          );
          const canBeUntoggled = selected ? selected.canBeUntoggled : true;

          return (
            <label
              key={dll.name}
              className={`flex items-center gap-2 ${
                !canBeUntoggled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Checkbox
                checked={isDllSelected(dll)}
                onCheckedChange={() => handleDllToggle(dll)}
                disabled={!canBeUntoggled}
              />
              {dll.name}
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-row items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Options
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Include DLLs</h2>
            <p className="text-sm text-muted-foreground">
              Select the extra DLLs that are required for the addin to work.
            </p>
            {dllsBrowser()}
            <div className="flex flex-row gap-2 w-full justify-end">
              <Button variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
