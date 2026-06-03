"use client";
import { Button } from "@/components/ui/button";
import { UserSettings } from "./UserSettings";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import PageWrapper from "@/components/PageWrapper";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <PageWrapper>
      <div className="flex flex-col h-full  ">
        {/* Header */}
        <div className=" bg-background ">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4"></div>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col thin-scrollbar  overflow-y-auto px-6 py-8">
          <div className="max-w-4xl w-full mx-auto">
            <UserSettings />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
