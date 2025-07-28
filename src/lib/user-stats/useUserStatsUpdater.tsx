import { useEffect } from "react";
import getTauriCommands from "../commands/getTauriCommands";

export default function useUserStatsUpdater() {
  const commands = getTauriCommands();

  useEffect(() => {
    const updateUserStats = async () => {
      try {
        await commands.updateUserStats();
      } catch (error) {
        console.error("Failed to update user stats:", error);
      }
    };

    // Initial update
    updateUserStats();

    // Set up interval for updates every 60 seconds
    const intervalId = setInterval(updateUserStats, 60000); // 60 seconds

    // Cleanup function to clear interval when component unmounts
    return () => {
      console.log("Clearing user stats updater interval");
      clearInterval(intervalId);
    };
  }, []);
}
