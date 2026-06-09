import { Badge } from "@/components/ui/badge";
import { HelpTicketStatus } from "@/lib/models/help-tickets/help-ticket-status";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<HelpTicketStatus, string> = {
  Open: "border-primary/30 bg-primary/10 text-primary",
  InProgress: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  Resolved: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  Closed: "border-muted-foreground/30 bg-muted text-muted-foreground",
  Rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<HelpTicketStatus, string> = {
  Open: "Open",
  InProgress: "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
  Rejected: "Rejected",
};

interface Props {
  status: HelpTicketStatus;
  className?: string;
}

export default function HelpTicketStatusBadge({ status, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn("font-sans", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
