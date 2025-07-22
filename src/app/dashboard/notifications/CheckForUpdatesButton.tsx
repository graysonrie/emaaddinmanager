import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import getTauriCommands from "@/lib/commands/getTauriCommands";

interface CheckForUpdatesButtonProps {
  onClick?: () => void;
}

export function CheckForUpdatesButton({ onClick }: CheckForUpdatesButtonProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleClick = async () => {
    try {
      setIsChecking(true);
      // This will trigger a manual check and emit events
      const result = await getTauriCommands().checkForUpdatesManual();
      console.log("Manual update check result:", result);
      onClick?.();
    } catch (error) {
      console.error("Failed to trigger manual update check:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isChecking}>
      {isChecking ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Checking...
        </>
      ) : (
        "Check for Updates"
      )}
    </Button>
  );
}
