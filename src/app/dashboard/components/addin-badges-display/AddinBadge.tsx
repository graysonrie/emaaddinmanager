import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderOpen, HelpCircle } from "lucide-react";
import { AddinPermissionModel } from "@/lib/addins/addin-management/types";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface AddinBadgeProps {
  addinPermission: AddinPermissionModel;
}

export default function AddinBadge({ addinPermission }: AddinBadgeProps) {
  // Extract the addin name from the path (last part after the last slash)
  const addinName = addinPermission.displayName;
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      if (addinPermission.referenceAddinPackage) {
        try {
          const [imageBytes, mimeType] =
            await getTauriCommands().loadImageDataForPackage(
              addinPermission.referenceAddinPackage
            );

          // Convert byte array to base64 (handle large arrays safely)
          let binaryString = "";
          for (let i = 0; i < imageBytes.length; i++) {
            binaryString += String.fromCharCode(imageBytes[i]);
          }
          const base64 = btoa(binaryString);
          const dataUrl = `data:${mimeType};base64,${base64}`;
          setImageData(dataUrl);
        } catch (error) {
          console.error("Failed to load image:", error);
          // Fallback to original image path
        }
      } else {
        // No package available, use fallback
      }
    };

    loadImage();
  }, [addinPermission.referenceAddinPackage, addinPermission.image]);

  const folderPath = addinPermission.relativePathToAddin
    .split("/")
    .slice(0, -1)
    .join("/");
  const addinImage = imageData;

  const helpFilePath =
    addinPermission.referenceAddinPackage?.relativePathToHelpFile;

  const handleOpenHelpFile = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (helpFilePath && addinPermission.referenceAddinPackage) {
      try {
        await getTauriCommands().openHelpFileForPackage(
          addinPermission.referenceAddinPackage
        );
      } catch (error) {
        console.error("Failed to open help file:", error);
        toast.error(
          "Failed to open documentation. Please check if Microsoft Word is installed."
        );
      }
    }
  };

  return (
    <Card
      className={`h-64 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/20 w-96 relative overflow-hidden !rounded-xl`}
    >
      {/* Background image container */}
      {addinImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
          style={{
            backgroundImage: `url(${addinImage})`,
          }}
        />
      )}

      {/* Dark overlay for better text readability when image exists */}
      {addinImage && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl" />
      )}

      {/* Content with proper z-index to appear above overlay */}
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                addinImage ? "bg-white/20 backdrop-blur-sm" : "bg-primary/10"
              }`}
            >
              <Package
                className={`w-8 h-8 ${
                  addinImage ? "text-white" : "text-primary"
                }`}
              />
            </div>
            <CardTitle
              className={`text-lg font-semibold truncate ${
                addinImage ? "text-white drop-shadow-lg" : "text-foreground"
              }`}
            >
              {addinName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-between flex-1">
          <div
            className={`flex items-center gap-2 text-md ${
              addinImage
                ? "text-white/90 drop-shadow-md"
                : "text-muted-foreground"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="truncate">{folderPath || "Root"}</span>
          </div>

          {/* Help file icon - only show if help file exists */}
          {helpFilePath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenHelpFile}
              className={`p-2 h-auto shrink-0 ${
                addinImage
                  ? "text-white/90 hover:text-white hover:bg-white/20"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              title="Open Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
