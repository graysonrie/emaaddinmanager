"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EmailSetup } from "@/app/setup/EmailSetup";
import { UserSettings } from "@/app/settings/UserSettings";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { EMA_DOMAIN } from "@/types/constants";

export default function Home() {
  const [showEmailSetup, setShowEmailSetup] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { data: userEmail, loading, error } = useConfigValue("userEmail");

  useEffect(() => {
    if (!loading && userEmail === undefined) {
      setShowEmailSetup(true);
    } else if (!loading && userEmail) {
      setShowEmailSetup(false);
    }
  }, [userEmail, loading]);

  const handleEmailSetupComplete = () => {
    setShowEmailSetup(false);
  };

  // Show loading state while checking config
  if (loading || showEmailSetup === null) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">
            Error Loading App
          </h1>
          <p className="text-sm text-muted-foreground">
            Please restart the application
          </p>
        </div>
      </div>
    );
  }

  // Show email setup if no email is found
  if (showEmailSetup) {
    return (
      <div className="flex  h-full items-center justify-center p-8 pb-20 sm:p-20">
        <EmailSetup
          onComplete={handleEmailSetupComplete}
          mustUseDomain={EMA_DOMAIN}
        />
      </div>
    );
  }

  // Show settings if requested
  if (showSettings) {
    return (
      <div className="relative flex items-center justify-items-center min-h-screen p-8 pb-20 gap-16">
        <div className="absolute top-4 left-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            ← Back
          </Button>
        </div>
        <UserSettings />
      </div>
    );
  }

  // Show main app content
  return (
    <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Settings Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4 mr-2 " />
          Settings
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">EMA Addin Manager</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {userEmail}
        </p>
      </div>
    </div>
  );
}
