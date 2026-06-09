"use client";

import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useLocalAddins from "@/lib/addins/local-addins/useLocalAddins";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import HelpTicketImagePicker from "../HelpTicketImagePicker";
import { dedupeAddinsById, resolveForAddinPath } from "../utils";

export default function OpenNewHelpTicketPage() {
  const router = useRouter();
  const userEmail = useConfigValue("userEmail");
  const { addins, loading: addinsLoading } = useLocalAddins();

  const [title, setTitle] = useState("");
  const [selectedAddinId, setSelectedAddinId] = useState("");
  const [message, setMessage] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const dedupedAddins = useMemo(() => dedupeAddinsById(addins), [addins]);
  const selectedAddin = dedupedAddins.find((a) => a.addinId === selectedAddinId);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedAddin || !message.trim() || !userEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const forAddin = await resolveForAddinPath(selectedAddin);
      if (!forAddin) {
        toast.error(
          "Could not resolve registry path for the selected addin. Make sure it exists in the addin registry.",
        );
        return;
      }

      const { createHelpTicket, addHelpTicketMessage } = getTauriCommands();
      const ticketId = await createHelpTicket({
        title: title.trim(),
        forAddin,
        openedByUser: userEmail,
        assignedToUser: selectedAddin.email || null,
      });

      await addHelpTicketMessage({
        helpTicketId: ticketId,
        message: message.trim(),
        fromUser: userEmail,
        absoluteImagePaths: imagePaths,
      });

      toast.success("Help ticket created.");
      router.push(`/dashboard/help-tickets/detail?id=${ticketId}`);
    } catch (err) {
      console.error("Failed to create help ticket:", err);
      toast.error("Failed to create help ticket.");
    } finally {
      setSubmitting(false);
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
              <h1 className="text-2xl font-bold">New Help Ticket</h1>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Addin</Label>
                <Select
                  value={selectedAddinId}
                  onValueChange={setSelectedAddinId}
                  disabled={submitting || addinsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an installed addin" />
                  </SelectTrigger>
                  <SelectContent>
                    {dedupedAddins.map((addin) => (
                      <SelectItem key={addin.addinId} value={addin.addinId}>
                        {addin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe the issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                  rows={6}
                />
              </div>

              <HelpTicketImagePicker
                imagePaths={imagePaths}
                onChange={setImagePaths}
                disabled={submitting}
              />

              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !title.trim() ||
                  !selectedAddinId ||
                  !message.trim() ||
                  addinsLoading
                }
                className="w-fit"
              >
                {submitting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Send className="size-4 mr-2" />
                )}
                Submit ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
