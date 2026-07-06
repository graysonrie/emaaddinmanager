import { check, Update } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";

export default function useAppUpdateCheck() {
  const [update, setUpdate] = useState<Update | undefined>(undefined);

  async function checkForUpdates() {
    try {
      const update = await check();
      if (update) {
        setUpdate(update);
      }
    } catch (err) {
      console.error("Failed to check for updates:", err);
    }
  }

  useEffect(() => {
    checkForUpdates();
  }, []);

  return { update };
}
