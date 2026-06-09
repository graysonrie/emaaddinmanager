"use client";

import { Button } from "@/components/ui/button";
import { getFileNameFromPath } from "@/lib/utils";
import { open } from "@tauri-apps/plugin-dialog";
import { ImagePlus, X } from "lucide-react";

interface Props {
  imagePaths: string[];
  onChange: (paths: string[]) => void;
  disabled?: boolean;
}

export default function HelpTicketImagePicker({
  imagePaths,
  onChange,
  disabled,
}: Props) {
  const handleAttach = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "webp"],
          },
        ],
      });

      if (!selected) {
        return;
      }

      const newPaths = Array.isArray(selected) ? selected : [selected];
      onChange([...imagePaths, ...newPaths]);
    } catch (err) {
      console.error("Failed to select images:", err);
    }
  };

  const removeImage = (index: number) => {
    onChange(imagePaths.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAttach}
        disabled={disabled}
        className="w-fit font-sans"
      >
        <ImagePlus className="size-4 mr-2" />
        Attach images
      </Button>
      {imagePaths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagePaths.map((path, index) => (
            <div
              key={`${path}-${index}`}
              className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs font-sans"
            >
              <span className="truncate max-w-48">
                {getFileNameFromPath(path)}
              </span>
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
