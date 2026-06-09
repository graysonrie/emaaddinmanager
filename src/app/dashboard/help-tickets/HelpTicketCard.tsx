import { Card, CardContent } from "@/components/ui/card";
import { HelpTicketPreviewModel } from "@/lib/models/help-tickets/help-ticket-preview.model";
import { HelpTicketStatus } from "@/lib/models/help-tickets/help-ticket-status";
import { cn } from "@/lib/utils";
import HelpTicketStatusBadge from "./HelpTicketStatusBadge";

const CARD_STYLES: Record<HelpTicketStatus, string> = {
  Open: "border-primary/20 bg-primary/5 hover:bg-primary/10",
  InProgress: "border-chart-3/20 bg-chart-3/5 hover:bg-chart-3/10",
  Resolved: "border-chart-2/20 bg-chart-2/5 hover:bg-chart-2/10",
  Closed: "border-muted-foreground/20 bg-muted/30 hover:bg-muted/50",
  Rejected: "border-destructive/20 bg-destructive/5 hover:bg-destructive/10",
};

interface Props {
  ticket: HelpTicketPreviewModel;
  onClick: () => void;
}

export default function HelpTicketCard({ ticket, onClick }: Props) {
  return (
    <Card
      className={cn(
        "w-full cursor-pointer transition-colors font-sans",
        CARD_STYLES[ticket.status],
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <p className="font-medium truncate">{ticket.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {ticket.forAddin}
            </p>
            <p className="text-xs text-muted-foreground">
              From: {ticket.fromUser}
              {ticket.assignedToUser && ` · Assigned: ${ticket.assignedToUser}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <HelpTicketStatusBadge status={ticket.status} />
            <p className="text-xs text-muted-foreground">
              Last updated: {ticket.updatedAt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
