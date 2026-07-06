import { relaunch } from "@tauri-apps/plugin-process";
import { Update } from "@tauri-apps/plugin-updater";
import { useState } from "react";

type UpdateStatus =
  | "idle"
  | "downloading"
  | "installing"
  | "completed"
  | "error";

export default function useAppUpdater() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function downloadUpdate(update: Update) {
    try {
      setStatus("downloading");
      setProgress(0);
      setDownloaded(0);
      setError(null);

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setContentLength(event.data.contentLength || 0);
            console.log(
              `started downloading ${event.data.contentLength} bytes`,
            );
            break;
          case "Progress":
            setDownloaded((prev) => prev + event.data.chunkLength);
            if (contentLength > 0) {
              const progressPercent = Math.round(
                ((downloaded + event.data.chunkLength) / contentLength) * 100,
              );
              setProgress(progressPercent);
            }
            console.log(
              `downloaded ${
                downloaded + event.data.chunkLength
              } from ${contentLength}`,
            );
            break;
          case "Finished":
            setStatus("installing");
            console.log("download finished");
            break;
        }
      });

      setStatus("completed");
      console.log("update installed");

      // Give user a moment to see completion status before relaunching
      setTimeout(async () => {
        await relaunch();
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Update failed");
      console.error("Update failed:", err);
    }
  }

  return {
    downloadUpdate,
    status,
    progress,
    error,
  };
}
