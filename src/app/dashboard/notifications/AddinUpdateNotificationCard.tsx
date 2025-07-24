import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { X, Download, Clock, CheckCircle, Info } from "lucide-react";
import { UpdateNotificationWithTime } from "@/lib/addins/addin-updater/update-notification-with-time.model";

interface AddinUpdateNotificationCardProps {
  notification: UpdateNotificationWithTime;
  onDismiss: () => void;
}

export default function AddinUpdateNotificationCard({
  notification,
  onDismiss,
}: AddinUpdateNotificationCardProps) {
  // Determine if this is a pending update (Revit is running) or completed update
  const isPendingUpdate = notification.notificationType === "warning";
  const isCompletedUpdate = notification.notificationType === "install";

  const getIcon = () => {
    if (isPendingUpdate) {
      return <Clock className="w-5 h-5 text-chart-3" />;
    } else if (isCompletedUpdate) {
      return <Download className="w-5 h-5 text-primary" />;
    } else {
      return <Info className="w-5 h-5 text-chart-2" />;
    }
  };

  const getCardStyle = () => {
    if (isPendingUpdate) {
      return "border-chart-3/20 bg-chart-3/10 hover:bg-chart-3/20 transition-colors";
    } else if (isCompletedUpdate) {
      return "border-primary/20 bg-primary/10 hover:bg-primary/20 transition-colors";
    } else {
      return "border-chart-2/20 bg-chart-2/10 hover:bg-chart-2/20 transition-colors";
    }
  };

  const getSimplifiedTime = (time: Date) => {
    // Format as "h:mm AM/PM"
    return time.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className={`w-full ${getCardStyle()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground mb-1">
                {notification.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {notification.description}
              </CardDescription>
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {getSimplifiedTime(notification.time)}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 flex-shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
