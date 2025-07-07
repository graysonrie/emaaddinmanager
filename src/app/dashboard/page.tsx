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
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import useUserStats from "@/lib/user-stats/useUserStats";

export default function Home() {
  const [showEmailSetup, setShowEmailSetup] = useState<boolean | null>(null);
  const { setIsOpen } = useSidebarStore();
  const userEmail = useKeyValueSubscription<string>("userEmail");
  const userName = useKeyValueSubscription<string>("userName");
  const router = useRouter();

  useEffect(() => {
    if (!userEmail || !userName) {
      setIsOpen(false);
      router.replace("/dashboard/setup");
    } else {
      setIsOpen(true);
    }
  }, [userEmail, userName, router]);

  const userStats = useUserStats();

  useEffect(() => {
    const addinNames = userStats.addinNames;
    console.log("addinNames", addinNames);
  }, [userStats.addinNames]);

  // Show main app content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
    >
      <p>Home</p>
    </motion.div>
  );
}
