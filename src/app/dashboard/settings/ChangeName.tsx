"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EMA_DOMAIN } from "@/types/constants";
import useConfig from "@/lib/persistence/config/useConfig";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { Mail, User } from "lucide-react";
import { EmailInputForm } from "@/components/EmailInputForm";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { NameInputForm } from "@/components/NameInputForm";

export default function ChangeName() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useConfig();

  const currentName = useKeyValueSubscription<string>("userName");

  const handleUpdateName = async (name: string) => {
    await changeUserStatsName(name);
    await update("userName", name);
    setIsEditing(false);
  };

  const { changeUserStatsName } = getTauriCommands();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-medium">Name</Label>
      </div>

      <div className="pl-6">
        {isEditing ? (
          <div className="space-y-4">

            <NameInputForm
              initialName={currentName || ""}
              onSubmit={handleUpdateName}
              submitLabel="Save Changes"
              disabled={isSubmitting}
              showLabel={false}
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
                {currentName || "No name set"}
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
