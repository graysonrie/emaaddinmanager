"use client";

import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Mail, User, Shield, Bell, Folder, HelpCircle } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { EmailInputForm } from "@/components/EmailInputForm";
import { EMA_DOMAIN } from "@/types/constants";
import { Input } from "@/components/ui/input";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import ChangeEmail from "./ChangeEmail";
import ChangeName from "./ChangeName";
import ChangeDisciplines from "./ChangeDisciplines";

export function UserSettings() {
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
            <ChangeEmail />
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-6">
            {/* Name Setting */}
            <ChangeName />
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-6">
            {/* Disciplines Setting */}
            <ChangeDisciplines />
          </div>
        </div>

        {/* Help Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Help</h3>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-6">
            <p className="text-sm font-sans">
              Encountered a bug? Please contact the maintainer at <b><a href="mailto:grieger@emaengineer.com">grieger@emaengineer.com</a></b>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
