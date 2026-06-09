"use client";

import { HelpTicketMessageModel } from "@/lib/models/help-tickets/help-ticket-message.model";
import { useMemo } from "react";
import HelpTicketMessageCard from "./HelpTicketMessageCard";

interface Props {
  messages: HelpTicketMessageModel[];
}

function sortMessagesChronologically(
  messages: HelpTicketMessageModel[],
): HelpTicketMessageModel[] {
  return [...messages].sort(
    (a, b) =>
      new Date(a.createdAtExact).getTime() -
      new Date(b.createdAtExact).getTime(),
  );
}

export default function HelpTicketMessageThread({ messages }: Props) {
  const sortedMessages = useMemo(
    () => sortMessagesChronologically(messages),
    [messages],
  );

  if (sortedMessages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-sans py-4">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      {sortedMessages.map((msg, index) => (
        <HelpTicketMessageCard
          key={`${msg.createdAtExact}-${msg.fromUser}-${index}`}
          message={msg}
        />
      ))}
    </div>
  );
}
