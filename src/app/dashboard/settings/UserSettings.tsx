"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Mail } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { EmailInputForm } from "@/components/EmailInputForm";
import { EMA_DOMAIN } from "@/types/constants";

export function UserSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useConfig();
  const { data: currentEmail } = useConfigValue("userEmail");

  const handleUpdateEmail = async (email: string) => {
    await update("userEmail", email);
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <CardTitle>User Settings</CardTitle>
        </div>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </Label>

          {isEditing ? (
            <EmailInputForm
              initialEmail={currentEmail || ""}
              onSubmit={handleUpdateEmail}
              submitLabel="Save"
              disabled={isSubmitting}
              showLabel={false}
              mustUseDomain={EMA_DOMAIN}
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {currentEmail || "No email set"}
              </span>
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
      </CardContent>
    </Card>
  );
}
