import { useEffect, useState } from "react";
import { Monitor, MonitorOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import getTauriCommands from "@/lib/commands/getTauriCommands";

export function RevitStatusIndicator() {
  const [isRevitRunning, setIsRevitRunning] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkRevitStatus = async () => {
    try {
      setIsLoading(true);
      const running = await getTauriCommands().isRevitRunning();
      setIsRevitRunning(running);
    } catch (error) {
      console.error("Failed to check Revit status:", error);
      setIsRevitRunning(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkRevitStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkRevitStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
        <span className="text-sm text-muted-foreground">
          Checking Revit status...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRevitRunning ? (
        <>
          <Monitor className="w-4 h-4 text-red-500 flex-shrink-0" />
          <Badge variant="destructive" className="text-xs">
            Revit Running
          </Badge>
        </>
      ) : (
        <>
          <MonitorOff className="w-4 h-4 text-green-500 flex-shrink-0" />
          <Badge variant="secondary" className="text-xs">
            Revit Closed
          </Badge>
        </>
      )}
    </div>
  );
}
