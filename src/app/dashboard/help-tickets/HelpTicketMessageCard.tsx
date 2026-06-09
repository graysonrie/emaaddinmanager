"use client";

import { useAuthStore } from "@/lib/auth/useAuthStore";
import { HelpTicketMessageModel } from "@/lib/models/help-tickets/help-ticket-message.model";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import HelpTicketImageAttachment from "./HelpTicketImageAttachment";

const adminStatusCache = new Map<string, boolean>();

async function checkIsAdminEmail(email: string): Promise<boolean> {
  const cached = adminStatusCache.get(email);
  if (cached !== undefined) {
    return cached;
  }

  const status = await useAuthStore.getState().isAdmin(email);
  const isAdmin = status === "admin" || status === "super";
  adminStatusCache.set(email, isAdmin);
  return isAdmin;
}

interface Props {
  message: HelpTicketMessageModel;
}

export default function HelpTicketMessageCard({ message }: Props) {
  const [isAdminMessage, setIsAdminMessage] = useState(
    () => adminStatusCache.get(message.fromUser) ?? false,
  );

  useEffect(() => {
    let cancelled = false;

    checkIsAdminEmail(message.fromUser).then((isAdmin) => {
      if (!cancelled) {
        setIsAdminMessage(isAdmin);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [message.fromUser]);

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isAdminMessage ? "border-primary/30 bg-primary/10" : "bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium">
          {message.fromUser}
          {isAdminMessage && (
            <span className="text-chart-2 font-sans text-xs"> (Admin)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{message.createdAt}</p>
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
      {message.absoluteImagePaths.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {message.absoluteImagePaths.map((path) => (
            <HelpTicketImageAttachment key={path} absolutePath={path} />
          ))}
        </div>
      )}
    </div>
  );
}
