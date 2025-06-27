"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EmailSetup } from "@/app/dashboard/setup/EmailSetup";
import { UserSettings } from "@/app/dashboard/settings/UserSettings";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { EMA_DOMAIN } from "@/types/constants";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "./sidebar/store";

export default function Home() {
  const [showEmailSetup, setShowEmailSetup] = useState<boolean | null>(null);
  const { setIsOpen } = useSidebarStore();
  const { data: userEmail, loading, error } = useConfigValue("userEmail");
  const router = useRouter();

  useEffect(() => {
    if (!loading && userEmail === undefined) {
      setIsOpen(false);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-8 w-8 border-b-2 border-primary"
          />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-screen items-center justify-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <h1 className="text-xl font-semibold text-destructive">
            Error Loading App
          </h1>
          <p className="text-sm text-muted-foreground">
            Please restart the application
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Show email setup if no email is found
  if (showEmailSetup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center p-8 pb-20 sm:p-20"
      >
        <EmailSetup
          onComplete={handleEmailSetupComplete}
          mustUseDomain={EMA_DOMAIN}
        />
      </motion.div>
    );
  }

  // Show main app content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
    >

    </motion.div>
  );
}
