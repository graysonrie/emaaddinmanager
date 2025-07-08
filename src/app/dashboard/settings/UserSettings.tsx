"use client";

import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Mail, User, Shield, Bell, Folder } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { EmailInputForm } from "@/components/EmailInputForm";
import { EMA_DOMAIN } from "@/types/constants";
import { Input } from "@/components/ui/input";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import getTauriCommands from "@/lib/commands/getTauriCommands";

export function UserSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useConfig();
  const currentEmail = useKeyValueSubscription<string>("userEmail");
  const { localRegistryPath, changeRegistryPath } = useAddinRegistry();
  const { changeUserStatsEmail } = getTauriCommands();

  const handleUpdateEmail = async (email: string) => {
    await changeUserStatsEmail(email);
    await update("userEmail", email);
    setIsEditing(false);
  };

  const handleRegistryInputClicked = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Select a directory",
    });
    if (selected) {
      changeRegistryPath(selected as string);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 ">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and personal information
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8 ">
        {/* Profile Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Profile Information</h3>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-6">
            {/* Email Setting */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-medium">Email Address</Label>
              </div>

              <div className="pl-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Update your email address for notifications and account
                      recovery
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
          </div>
        </div>

        {/* Coming Soon Sections */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Security & Privacy</h3>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Password Management</p>
                <p className="text-sm text-muted-foreground">
                  Change your password and manage security settings
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Local Addin Registry</h3>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 w-full">
                <p className="font-medium">Registry Path</p>
                <p className="text-sm text-muted-foreground">
                  Configure the local addin registry path
                </p>
                <Input
                  value={localRegistryPath}
                  className="w-full mt-4"
                  readOnly={true}
                  onClick={handleRegistryInputClicked}
                />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
