"use client";

import { HelpTicketMessageModel } from "@/lib/models/help-tickets/help-ticket-message.model";
import { convertFileSrc } from "@tauri-apps/api/core";

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
        <div
          key={`${msg.createdAt}-${msg.fromUser}-${index}`}
          className="rounded-lg border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-medium">{msg.fromUser}</p>
            <p className="text-xs text-muted-foreground">{msg.createdAt}</p>
          </div>
          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
          {msg.absoluteImagePaths.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {msg.absoluteImagePaths.map((path) => (
                <img
                  key={path}
                  src={convertFileSrc(path)}
                  alt="Attachment"
                  className="max-h-48 rounded-md border object-contain"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
