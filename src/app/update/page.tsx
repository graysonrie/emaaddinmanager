"use client";
import PageWrapper from "@/components/PageWrapper";
import { useUpdateStore } from "./store";
import useAppUpdater from "@/lib/hooks/useAppUpdater";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect } from "react";
import {
  CheckCircle,
  Download,
  Loader2,
  MessageCircleWarningIcon,
} from "lucide-react";

export default function UpdatePage() {
  const { update, setUpdate } = useUpdateStore();
  const { downloadUpdate, status, progress, error } = useAppUpdater();

  useEffect(() => {
    const checkForUpdate = async () => {
      const update = await check();
      if (update) {
        setUpdate(update);
      }
    };
    checkForUpdate();
  }, [setUpdate]);

  async function onInstallClicked() {
    if (update) {
      downloadUpdate(update);
    }
  }

  const isUpdateInProgress =
    status === "downloading" || status === "installing";
  const isCompleted = status === "completed";

  const statusText = (() => {
    switch (status) {
      case "downloading":
        return `Downloading update... ${progress}%`;
      case "installing":
        return "Installing update...";
      case "completed":
        return "Update completed! Restarting app...";
      case "error":
        return "Update failed";
      default:
        return "";
    }
  })();

  const statusIcon = (() => {
    switch (status) {
      case "downloading":
        return <Download className="size-5 animate-pulse" />;
      case "installing":
        return <Loader2 className="size-5 animate-spin" />;
      case "completed":
        return <CheckCircle className="size-5 text-green-500" />;
      case "error":
        return <MessageCircleWarningIcon className="size-5 text-red-500" />;
      default:
        return <></>;
    }
  })();

  return (
    <PageWrapper>
      <div className="flex flex-col font-sans gap-4 w-full max-w-md h-full mx-auto thin-scrollbar items-center justify-center px-4">
        <div className="flex flex-row gap-2 items-center">
          <MessageCircleWarningIcon className="size-6 text-red-500" />
          <h1 className="text-2xl font-bold font-sans">Required Update</h1>
        </div>

        <Label>Version {update?.version}</Label>
        {update?.body && (
          <Label className="text-center whitespace-pre-wrap">
            {update.body}
          </Label>
        )}

        <div className="flex flex-row gap-2 items-center text-sm text-muted-foreground">
          {statusIcon}
          <span>{statusText}</span>
        </div>

        {status === "downloading" && (
          <div className="w-full space-y-1">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              {progress}%
            </p>
          </div>
        )}

        {status === "error" && error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={onInstallClicked}
          disabled={isUpdateInProgress || isCompleted}
          className="w-full"
        >
          {isUpdateInProgress ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              {status === "downloading" ? "Downloading..." : "Installing..."}
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle className="size-4 mr-2" />
              Restarting...
            </>
          ) : status === "error" ? (
            "Retry Update"
          ) : (
            "Install Update"
          )}
        </Button>
      </div>
    </PageWrapper>
  );
}
