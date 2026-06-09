"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import HelpTicketImagePicker from "./HelpTicketImagePicker";

interface Props {
  onSubmit: (message: string, imagePaths: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function HelpTicketReplyForm({ onSubmit, disabled }: Props) {
  const [message, setMessage] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(message.trim(), imagePaths);
      setMessage("");
      setImagePaths([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      <Textarea
        placeholder="Write a reply..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled || submitting}
        rows={4}
      />
      <HelpTicketImagePicker
        imagePaths={imagePaths}
        onChange={setImagePaths}
        disabled={disabled || submitting}
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || submitting || !message.trim()}
        className="w-fit"
      >
        {submitting ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <Send className="size-4 mr-2" />
        )}
        Send reply
      </Button>
    </div>
  );
}
