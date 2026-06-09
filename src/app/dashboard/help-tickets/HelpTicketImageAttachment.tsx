"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { getFileNameFromPath } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function createObjectUrl(imageBytes: number[], mimeType: string): string {
  return URL.createObjectURL(
    new Blob([new Uint8Array(imageBytes)], { type: mimeType }),
  );
}

interface Props {
  absolutePath: string;
}

export default function HelpTicketImageAttachment({ absolutePath }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const [imageBytes, mimeType] =
          await getTauriCommands().loadHelpTicketImage(absolutePath);
        if (cancelled) {
          return;
        }

        // Yield so admin styling and other UI updates can paint first.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        if (cancelled) {
          return;
        }

        setObjectUrl(createObjectUrl(imageBytes, mimeType));
      } catch (err) {
        console.error("Failed to load help ticket image:", err);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadImage();
    return () => {
      cancelled = true;
    };
  }, [absolutePath]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (loading) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !objectUrl) {
    return (
      <div
        className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted px-1 text-center text-[10px] text-muted-foreground"
        title={getFileNameFromPath(absolutePath)}
      >
        Failed to load
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-16 w-16 overflow-hidden rounded-md border bg-muted transition-opacity hover:opacity-80"
        title={getFileNameFromPath(absolutePath)}
      >
        <img
          src={objectUrl}
          alt={getFileNameFromPath(absolutePath) ?? "Attachment"}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          <DialogTitle className="sr-only">
            {getFileNameFromPath(absolutePath) ?? "Image attachment"}
          </DialogTitle>
          <img
            src={objectUrl}
            alt={getFileNameFromPath(absolutePath) ?? "Attachment"}
            className="max-h-[85vh] w-full object-contain"
            decoding="async"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
