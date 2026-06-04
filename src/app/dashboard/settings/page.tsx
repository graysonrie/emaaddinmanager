"use client";

import { UserSettings } from "./UserSettings";

import PageWrapper from "@/components/PageWrapper";

export default function SettingsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col h-full">
        <div className="flex flex-col thin-scrollbar overflow-y-auto px-6 py-8">
          <div className="max-w-4xl w-full mx-auto">
            <UserSettings />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
