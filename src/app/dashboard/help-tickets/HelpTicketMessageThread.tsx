"use client";

import { HelpTicketMessageModel } from "@/lib/models/help-tickets/help-ticket-message.model";
import HelpTicketMessageCard from "./HelpTicketMessageCard";

interface Props {
  messages: HelpTicketMessageModel[];
}

export default function HelpTicketMessageThread({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-sans py-4">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 font-sans">
      {messages.map((msg, index) => (
        <HelpTicketMessageCard
          key={`${msg.createdAt}-${msg.fromUser}-${index}`}
          message={msg}
        />
      ))}
    </div>
  );
}
