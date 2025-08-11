import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePackageDialogStore } from "./store";
import { AddinModel } from "@/lib/models/addin.model";
import { CreateAddinPackageRequestModel } from "@/lib/models/create-addin-package-request.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FileText, Image, X } from "lucide-react";

import getTauriCommands from "@/lib/commands/getTauriCommands";
import { toast } from "sonner";

interface CreatePackageDialogProps {
  addin: AddinModel;
  onComplete: () => void;
}

export default function CreatePackageDialog({
  addin,
  onComplete,
}: CreatePackageDialogProps) {
  const {
    isOpen,
    setIsOpen,
    setPendingRequest,
    isEditMode,
    setIsEditMode,
    existingPackage,
    setExistingPackage,
  } = useCreatePackageDialogStore();

  const [formData, setFormData] = useState<CreateAddinPackageRequestModel>({
    addinVersion: "1.0.0",
    pathToHelpFile: null,
    pathToImageFile: "",
    displayName: addin.name,
    disciplinePackage: null,
    emoji: null,
  });

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [existingPathsValid, setExistingPathsValid] = useState({
    image: false,
    help: false,
  });

  // Load existing package data when editing
  useEffect(() => {
    if (isEditMode && existingPackage) {
      setFormData({
        addinVersion: existingPackage.addinVersion,
        pathToHelpFile: existingPackage.absolutePathToHelpFile || null,
        pathToImageFile: existingPackage.absolutePathToImage || "",
        displayName: existingPackage.displayName,
        disciplinePackage: existingPackage.disciplinePackage || null,
        emoji: existingPackage.emoji || null,
      });
      setSelectedDiscipline(existingPackage.disciplinePackage || "");
    } else {
      // Reset form when creating new package
      setFormData({
        addinVersion: "1.0.0",
        pathToHelpFile: null,
        pathToImageFile: "",
        displayName: addin.name,
        disciplinePackage: null,
        emoji: null,
      });
      setSelectedDiscipline("");
    }
  }, [isEditMode, existingPackage, addin.name]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
    }
  }, [isOpen]);

  // Check if existing paths are valid when editing
  useEffect(() => {
    if (isEditMode && existingPackage) {
      const validatePaths = async () => {
        const tauriCommands = getTauriCommands();

        const imageValid = existingPackage.absolutePathToImage
          ? await tauriCommands.checkFileExists(
              existingPackage.absolutePathToImage
            )
          : false;

        const helpValid = existingPackage.absolutePathToHelpFile
          ? await tauriCommands.checkFileExists(
              existingPackage.absolutePathToHelpFile
            )
          : false;

        setExistingPathsValid({
          image: imageValid,
          help: helpValid,
        });

        // If paths are invalid, clear them from form data
        if (!imageValid && existingPackage.absolutePathToImage) {
          setFormData((prev) => ({ ...prev, pathToImageFile: "" }));
        }
        if (!helpValid && existingPackage.absolutePathToHelpFile) {
          setFormData((prev) => ({ ...prev, pathToHelpFile: null }));
        }
      };

      validatePaths();
    }
  }, [isEditMode, existingPackage]);

  const handleImageFileSelect = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Image Files",
            extensions: ["png", "jpg", "jpeg"],
          },
        ],
      });

      if (selected && !Array.isArray(selected)) {
        setFormData((prev) => ({
          ...prev,
          pathToImageFile: selected,
        }));
      }
    } catch (error) {
      console.error("Failed to select image file:", error);
    }
  };

  const handleHelpFileSelect = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Word Documents",
            extensions: ["doc", "docx"],
          },
        ],
      });

      if (selected && !Array.isArray(selected)) {
        setFormData((prev) => ({
          ...prev,
          pathToHelpFile: selected,
        }));
      }
    } catch (error) {
      console.error("Failed to select help file:", error);
    }
  };

  const handleComplete = async () => {
    // Validate form data
    if (!formData.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }

    if (!formData.pathToImageFile) {
      toast.error("Image file is required");
      return;
    }

    try {
      setIsCreating(true);
      const tauriCommands = getTauriCommands();
      await tauriCommands.createPackageForRegistryAddin(addin, formData);
      toast.success(
        isEditMode
          ? "Package updated successfully!"
          : "Package created successfully!"
      );
      setPendingRequest(formData);
      setIsOpen(false);
      onComplete();
    } catch (error) {
      console.error("Failed to create package:", error);
      toast.error(
        isEditMode
          ? "Failed to update package. Please try again."
          : "Failed to create package. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsEditMode(false);
    setExistingPackage(null);
  };

  const clearHelpFile = () => {
    setFormData((prev) => ({
      ...prev,
      pathToHelpFile: null,
    }));
  };

  const clearImageFile = () => {
    setFormData((prev) => ({
      ...prev,
      pathToImageFile: "",
    }));
  };

  // Utility function to truncate paths from the start
  const truncatePath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    return `...${path.slice(-(maxLength - 3))}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Package for " : "Create Package for "}
            <span className="text-primary">{addin.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Addin Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Addin Version *</Label>
            <Input
              id="version"
              type="text"
              value={formData.addinVersion}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addinVersion: e.target.value,
                }))
              }
              placeholder="1.0.0"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="Enter display name"
            />
          </div>

          {/* Image File Selection */}
          <div className="space-y-2">
            <Label>Image File (PNG/JPEG) *</Label>
            {isEditMode && (
              <div className="space-y-1">
                {existingPathsValid.image ? (
                  <p className="text-xs text-green-600">
                    ✓ Using existing image file path
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No image selected
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleImageFileSelect}
                className="flex-1"
              >
                <Image className="w-4 h-4 mr-2" />
                {isEditMode && existingPathsValid.image
                  ? "Change Image"
                  : "Select Image"}
              </Button>
              {formData.pathToImageFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearImageFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.pathToImageFile && (
              <div
                className="text-sm text-muted-foreground truncate"
                title={formData.pathToImageFile}
              >
                {truncatePath(formData.pathToImageFile)}
              </div>
            )}
          </div>

          {/* Help File Selection */}
          <div className="space-y-2">
            <Label>Help File (Word Document) - Optional</Label>
            {isEditMode && (
              <div className="space-y-1">
                {existingPathsValid.help ? (
                  <p className="text-xs text-green-600">
                    ✓ Using existing help file path
                  </p>
                ) : null}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleHelpFileSelect}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isEditMode && existingPathsValid.help
                  ? "Change Help File"
                  : "Select Help File"}
              </Button>
              {formData.pathToHelpFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearHelpFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.pathToHelpFile && (
              <div
                className="text-sm text-muted-foreground truncate"
                title={formData.pathToHelpFile}
              >
                {truncatePath(formData.pathToHelpFile)}
              </div>
            )}
          </div>

          {/* Discipline Selection */}
          <div className="space-y-2">
            <Label htmlFor="discipline">Discipline Package (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              Only set this field if this is the defacto addin for this
              discipline.
            </p>
            <Input
              id="discipline"
              type="text"
              value={selectedDiscipline}
              onChange={(e) => {
                const discipline = e.target.value;
                setSelectedDiscipline(discipline);
                setFormData((prev) => ({
                  ...prev,
                  disciplinePackage: discipline || null,
                }));
              }}
              placeholder="e.g., Electrical, Mechanical"
            />
          </div>

          {/* Emoji Selection - Only show when discipline is set */}
          {selectedDiscipline.trim() && (
            <div className="space-y-2">
              <Label htmlFor="emoji">Discipline Emoji</Label>
              <p className="text-xs text-muted-foreground">
                Add an emoji to represent this discipline package.
              </p>
              <Input
                id="emoji"
                type="text"
                value={formData.emoji || ""}
                onChange={(e) => {
                  const emoji = e.target.value;
                  // Limit to single emoji (most emojis are 2-4 characters)
                  if (emoji.length <= 4) {
                    setFormData((prev) => ({
                      ...prev,
                      emoji: emoji || null,
                    }));
                  }
                }}
                placeholder="e.g., ⚡ 🔌 🏗️"
                maxLength={4}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <div className="text-xs text-muted-foreground">* Required fields</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={
                !formData.pathToImageFile ||
                !formData.displayName.trim() ||
                isCreating
              }
            >
              {isCreating
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Complete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
