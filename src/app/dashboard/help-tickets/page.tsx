"use client";

import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { HelpTicketPreviewModel } from "@/lib/models/help-tickets/help-ticket-preview.model";
import { Loader2, Plus, TicketsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import HelpTicketCard from "./HelpTicketCard";
import { useHelpTicketsStore } from "./store";
import { sortTicketPreviews } from "./utils";

export default function HelpTicketsPage() {
  const router = useRouter();
  const { adminViewOverride, setAdminViewOverride, isAdminView } =
    useHelpTicketsStore();
  const [tickets, setTickets] = useState<HelpTicketPreviewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    removeNonexistantTicketsFromConfig,
    getHelpTicketPreviews,
    getOwnedTicketPreviews,
    purgeClosedHelpTickets,
  } = getTauriCommands();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      await removeNonexistantTicketsFromConfig();
      const admin = await isAdminView();
      setIsAdmin(admin);
      const previews = admin
        ? await getHelpTicketPreviews()
        : await getOwnedTicketPreviews();
      setTickets(sortTicketPreviews(previews, admin));
    } catch (err) {
      console.error("Failed to load help tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdminView]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets, adminViewOverride]);

  const handleAdminToggle = (checked: boolean) => {
    setAdminViewOverride(checked);
  };

  const handleResetOverride = () => {
    setAdminViewOverride(null);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const isAdmin = await isAdminView();
      if (isAdmin) {
        console.log("Purging closed help tickets");
        purgeClosedHelpTickets();
      }
    };
    checkAdmin();
  }, [isAdminView]);

  return (
    <PageWrapper>
      <div className="flex justify-center h-full">
        <div className="w-full max-w-4xl flex flex-col gap-6 p-6 h-full">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Help Tickets</h1>
              <p className="text-muted-foreground text-sm mt-1">
                View and manage your help tickets.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="admin-view"
                  checked={isAdmin}
                  onCheckedChange={handleAdminToggle}
                />
                <Label htmlFor="admin-view" className="text-sm font-sans">
                  View as admin
                </Label>
                {adminViewOverride !== null && (
                  <button
                    onClick={handleResetOverride}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <Button
                onClick={() => router.push("/dashboard/help-tickets/open-new")}
                className="font-sans"
              >
                <Plus className="size-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto thin-scrollbar flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <TicketsIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No help tickets
                </h3>
                <p className="text-muted-foreground mb-4">
                  You have no help tickets yet. Open a new ticket to get
                  support.
                </p>
                <Button
                  onClick={() =>
                    router.push("/dashboard/help-tickets/open-new")
                  }
                  variant="outline"
                  className="font-sans"
                >
                  <Plus className="size-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <HelpTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() =>
                      router.push(
                        `/dashboard/help-tickets/detail?id=${ticket.id}`,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
