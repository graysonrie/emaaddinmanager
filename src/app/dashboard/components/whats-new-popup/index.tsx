"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWhatsNewPopupStore } from "./store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdaterPopupStore } from "../updater-popup/store";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";

export default function WhatsNewPopup() {
  const { isVisible, setIsVisible } = useWhatsNewPopupStore();
  const { isVisible: isUpdaterPopupVisible } = useUpdaterPopupStore();

  useEffect(() => {
    const checkForWhatsNew = async () => {
      const store = await load("store.json", {
        autoSave: false,
        defaults: {
          version: null as string | null,
        },
      });
      const version = await getVersion();
      const storedVersion = await store.get("version");
      if (storedVersion !== version) {
        // If the stored version does not match the current version, show the popup
        setIsVisible(true);
        await store.set("version", version);
      }
    };
    checkForWhatsNew();
  }, []);

  return (
    <Dialog
      open={isVisible && !isUpdaterPopupVisible}
      onOpenChange={setIsVisible}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">What's New</DialogTitle>
        </DialogHeader>

        <Label className="font-normal font-sans leading-5 ">
          Support tickets have been added! Please do not send Teams messages to
          Jeremy if you encounter issues with an addin. Instead, use the 'Help
          Tickets' feature to the left and submit a bug report or feature
          request there so that the Bases team can efficiently review it.
        </Label>

        <DialogFooter className="flex flex-row gap-2 w-full">
          <Button onClick={() => setIsVisible(false)} className="w-full">
            Great. I don't care
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
