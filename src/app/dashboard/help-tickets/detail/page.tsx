"use client";

import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { HelpTicketModel } from "@/lib/models/help-tickets/help-ticket.model";
import { HelpTicketStatus } from "@/lib/models/help-tickets/help-ticket-status";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import HelpTicketMessageThread from "../HelpTicketMessageThread";
import HelpTicketReplyForm from "../HelpTicketReplyForm";
import HelpTicketStatusBadge from "../HelpTicketStatusBadge";
import { useHelpTicketsStore } from "../store";

const ALL_STATUSES: HelpTicketStatus[] = [
  "Open",
  "InProgress",
  "Resolved",
  "Closed",
  "Rejected",
];

const STATUS_LABELS: Record<HelpTicketStatus, string> = {
  Open: "Open",
  InProgress: "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
  Rejected: "Rejected",
};

function HelpTicketDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id") ?? "";
  const userEmail = useConfigValue("userEmail");
  const { isAdminView } = useHelpTicketsStore();

  const [ticket, setTicket] = useState<HelpTicketModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTicket = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      if (!options?.silent) {
        setLoading(true);
      }

      try {
        const admin = await isAdminView();
        setIsAdmin(admin);
        const data = await getTauriCommands().getHelpTicketWithId(ticketId);
        setTicket(data);
      } catch (err) {
        console.error("Failed to load help ticket:", err);
        toast.error("Failed to load help ticket.");
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [ticketId, isAdminView],
  );

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleReply = async (message: string, imagePaths: string[]) => {
    if (!userEmail) {
      toast.error("User email not available.");
      return;
    }

    await getTauriCommands().addHelpTicketMessage({
      helpTicketId: ticketId,
      message,
      fromUser: userEmail,
      absoluteImagePaths: imagePaths,
    });
    toast.success("Reply sent.");
    await loadTicket({ silent: true });
  };

  const handleStatusChange = async (status: HelpTicketStatus) => {
    const previousTicket = ticket;
    setTicket((prev) => (prev ? { ...prev, status } : prev));
    setUpdatingStatus(true);
    try {
      await getTauriCommands().setHelpTicketStatus(ticketId, status);
      toast.success("Status updated.");
      await loadTicket({ silent: true });
    } catch (err) {
      setTicket(previousTicket);
      console.error("Failed to update status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col h-full">
        <div className="flex flex-col thin-scrollbar overflow-y-auto px-6 py-8">
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 font-sans">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/dashboard/help-tickets")}
                variant="outline"
                size="icon"
                className="cursor-pointer"
              >
                <ArrowLeft />
              </Button>
              <h1 className="text-2xl font-bold">Ticket Details</h1>
            </div>

            {!ticketId ? (
              <p className="text-muted-foreground">No ticket selected.</p>
            ) : loading && !ticket ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : ticket ? (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-semibold">{ticket.title}</h2>
                    <HelpTicketStatusBadge status={ticket.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-medium">Addin:</span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.forAddin}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Opened by:</span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.openedByUser}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Assigned to:</span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.assignedToUser ?? "Unassigned"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Created:</span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.createdAt}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Updated:</span>{" "}
                      <span className="text-muted-foreground">
                        {ticket.updatedAt}
                      </span>
                    </p>
                    {ticket.closedAt && (
                      <p>
                        <span className="font-medium">Closed:</span>{" "}
                        <span className="text-muted-foreground">
                          {ticket.closedAt}
                        </span>
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-3 mt-2">
                      <Label className="shrink-0">Status</Label>
                      <Select
                        value={ticket.status}
                        onValueChange={(v) =>
                          handleStatusChange(v as HelpTicketStatus)
                        }
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Messages</h3>
                  <HelpTicketMessageThread messages={ticket.messages} />
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-medium">Reply</h3>
                  <HelpTicketReplyForm onSubmit={handleReply} />
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Ticket not found.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function HelpTicketDetailPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </PageWrapper>
      }
    >
      <HelpTicketDetailContent />
    </Suspense>
  );
}
