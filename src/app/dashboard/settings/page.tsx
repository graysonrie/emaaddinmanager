"use client";
import { Button } from "@/components/ui/button";
import { UserSettings } from "./UserSettings";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <div className="relative flex items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
        >
          ← Back
        </Button>
      </div>
      <UserSettings />
    </div>
  );
}
