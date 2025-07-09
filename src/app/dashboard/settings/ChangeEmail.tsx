"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EMA_DOMAIN } from "@/types/constants";
import useConfig from "@/lib/persistence/config/useConfig";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { Mail } from "lucide-react";
import { EmailInputForm } from "@/components/EmailInputForm";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";

export default function ChangeEmail() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useConfig();

  const currentEmail = useKeyValueSubscription<string>("userEmail");

  const handleUpdateEmail = async (email: string) => {
    await changeUserStatsEmail(email);
    await update("userEmail", email);
    setIsEditing(false);
  };

  const { changeUserStatsEmail } = getTauriCommands();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-medium">Email Address</Label>
      </div>

      <div className="pl-6">
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Update your email address for notifications and account recovery
            </p>
            <EmailInputForm
              initialEmail={currentEmail || ""}
              onSubmit={handleUpdateEmail}
              submitLabel="Save Changes"
              disabled={isSubmitting}
              showLabel={false}
              mustUseDomain={EMA_DOMAIN}
            />
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {currentEmail || "No email address set"}
              </p>
              <p className="text-xs text-muted-foreground">
                Used for notifications and account recovery
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
