"use client";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "../ui/button";
import { Minus, X, Square } from "lucide-react";
import { AppLogo } from "./AppLogo";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { useMemo } from "react";
import UserAvatar from "@/app/shared/UserAvatar";

export function WindowChrome() {
  const userName = useKeyValueSubscription<string>("userName");

  const userFirstName = useMemo(() => {
    return userName?.split(" ")[0];
  }, [userName]);

  const userNameInitials = useMemo(() => {
    return userName
      ?.split(" ")
      .map((name) => name[0])
      .join("");
  }, [userName]);

  const handleMinimize = () => {
    getCurrentWindow().minimize();
  };

  const handleMaximize = async () => {
    const isMaximized = await getCurrentWindow().isMaximized();
    if (isMaximized) {
      getCurrentWindow().unmaximize();
    } else {
      getCurrentWindow().maximize();
    }
  };

  const handleClose = () => {
    getCurrentWindow().close();
  };

  return (
    <div className="titlebar flex items-center justify-between bg-background border-b border-border px-4 py-2 select-none">
      <div className="flex-1">
        <AppLogo />
      </div>

      <UserAvatar userName={userName} />

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMinimize}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaximize}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
