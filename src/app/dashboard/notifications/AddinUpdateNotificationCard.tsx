import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { X, Download, Clock, CheckCircle } from "lucide-react";

interface AddinUpdateNotificationCardProps {
  notification: UpdateNotificationModel;
  onDismiss: () => void;
}

export default function AddinUpdateNotificationCard({
  notification,
  onDismiss,
}: AddinUpdateNotificationCardProps) {
  // Determine if this is a pending update (Revit is running) or completed update
  const isPendingUpdate = notification.description.includes(
    "will be updated once Revit is closed"
  );
  const isCompletedUpdate =
    notification.description.includes("has been updated");

  const getIcon = () => {
    if (isPendingUpdate) {
      return <Clock className="w-5 h-5 text-info" />;
    } else if (isCompletedUpdate) {
      return <CheckCircle className="w-5 h-5 text-chart-2" />;
    } else {
      return <Download className="w-5 h-5 text-chart-2" />;
    }
  };

  const getCardStyle = () => {
    if (isPendingUpdate) {
      return "border-info/20 bg-info/10 hover:bg-info/20 transition-colors";
    } else if (isCompletedUpdate) {
      return "border-chart-2/20 bg-chart-2/10 hover:bg-chart-2/20 transition-colors";
    } else {
      return "border-chart-2/20 bg-chart-2/10 hover:bg-chart-2/20 transition-colors";
    }
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
