import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { HelpTicketNotificationWithTime } from "@/lib/help-tickets/help-ticket-notification-with-time.model";
import { MessageSquare, RefreshCw, TicketsIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  notification: HelpTicketNotificationWithTime;
  onDismiss: () => void;
}

export default function HelpTicketUpdateNotificationCard({
  notification,
  onDismiss,
}: Props) {
  const router = useRouter();
  const getIcon = () => {
    if (notification.updateType === "statusChanged") {
      return <RefreshCw className="w-5 h-5 text-chart-3" />;
    }
    if (notification.updateType === "newTicket") {
      return <TicketsIcon className="w-5 h-5 text-chart-2" />;
    }
    return <MessageSquare className="w-5 h-5 text-primary" />;
  };

  const getCardStyle = () => {
    if (notification.updateType === "statusChanged") {
      return "border-chart-3/20 bg-chart-3/10 hover:bg-chart-3/20 transition-colors";
    }
    if (notification.updateType === "newTicket") {
      return "border-chart-2/20 bg-chart-2/10 hover:bg-chart-2/20 transition-colors";
    }
    return "border-primary/20 bg-primary/10 hover:bg-primary/20 transition-colors";
  };

  const getSimplifiedTime = (time: Date) => {
    return time.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card
      className={`w-full cursor-pointer font-sans ${getCardStyle()}`}
      onClick={() =>
        router.push(
          `/dashboard/help-tickets/detail?id=${notification.ticketId}`,
        )
      }
    >
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
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="h-8 w-8 p-0 flex-shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
