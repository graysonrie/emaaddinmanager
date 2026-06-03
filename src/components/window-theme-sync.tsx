"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import getTauriCommands from "@/lib/commands/getTauriCommands";

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Keeps Windows Mica tint aligned with next-themes (including persisted preference). */
export function WindowThemeSync() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !theme || !isTauriRuntime()) return;

    const { applyWindowLight, applyWindowDark, applyWindowSystem } =
      getTauriCommands();

    const apply = async () => {
      if (theme === "light") {
        await applyWindowLight();
      } else if (theme === "dark") {
        await applyWindowDark();
      } else {
        await applyWindowSystem();
      }
    };

    void apply().catch((err) => {
      console.warn("Failed to sync window theme with app theme:", err);
    });
  }, [mounted, theme]);

  return null;
}
