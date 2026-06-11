import { useEffect } from "react";
import getTauriCommands from "../commands/getTauriCommands";

export default function useUserStatsUpdater() {
  const commands = getTauriCommands();

  useEffect(() => {
    const syncUserStats = async () => {
      try {
        // Upload-only sync that skips the request when nothing changed and
        // avoids re-downloading the data we just sent.
        await commands.syncUserStats();
        console.log("Synced user stats");
      } catch (error) {
        console.warn("Failed to sync user stats:", error);
      }
    };

    // Initial sync
    syncUserStats();

    // Stats rarely change and are not real-time critical, so poll every 5
    // minutes. Install, update, and uninstall flows sync immediately in the backend.
    const intervalId = setInterval(syncUserStats, 300000); // 5 minutes

    // Cleanup function to clear interval when component unmounts
    return () => {
      console.log("Clearing user stats updater interval");
      clearInterval(intervalId);
    };
  }, []);
}
