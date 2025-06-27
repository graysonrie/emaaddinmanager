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
  const { data: userEmail, loading: emailLoading } =
    useConfigValue("userEmail");
  const { data: userName, loading: nameLoading } = useConfigValue("userName");
  const router = useRouter();

  useEffect(() => {
    if (!emailLoading && !nameLoading && (!userEmail || !userName)) {
      setIsOpen(false);
      router.replace("/dashboard/setup");
    }else{
      setIsOpen(true);
    }
  }, [userEmail, userName, emailLoading, nameLoading, router]);

  // Show error state
  if (emailLoading || nameLoading) {
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


  // Show main app content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
    ></motion.div>
  );
}
