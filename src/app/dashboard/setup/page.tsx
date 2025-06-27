"use client";

import { useState, useEffect } from "react";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { useRouter } from "next/navigation";
import { EmailSetup } from "./EmailSetup";
import { UserSettings } from "../settings/UserSettings";
import { EMA_DOMAIN } from "@/types/constants";
import { motion, AnimatePresence } from "framer-motion";
import { NameSetup } from "./NameSetup";
import { useSidebarStore } from "../sidebar/store";

export const SUCCESS_DELAY = 1800; // ms

export default function SetupPage() {
  const {
    data: userEmail,
    loading: emailLoading,
    error: emailError,
  } = useConfigValue("userEmail");
  const {
    data: userName,
    loading: nameLoading,
    error: nameError,
  } = useConfigValue("userName");
  const { isOpen, setIsOpen } = useSidebarStore();
  const [step, setStep] = useState<"email" | "name" | "done">("email");
  const router = useRouter();

  useEffect(() => {
    if (!emailLoading && !userEmail) {
      setIsOpen(false);
      setStep("email");
    } else if (!nameLoading && !userName) {
      setIsOpen(false);
      setStep("name");
    } else if (userEmail && userName) {
      setStep("done");
    }
  }, [userEmail, userName, emailLoading, nameLoading]);

  useEffect(() => {
    if (step === "done") {
      setTimeout(() => {
        router.replace("/dashboard");
      }, SUCCESS_DELAY);
      return;

      router.replace("/dashboard");
    }
  }, [step, router]);

  if (emailLoading || nameLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (emailError || nameError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span>Error loading setup. Please restart the app.</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full items-center justify-center p-8 pb-20 sm:p-20"
    >
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            <EmailSetup
              onComplete={() => setStep("name")}
              mustUseDomain={EMA_DOMAIN}
            />
          </motion.div>
        )}
        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            <NameSetup onComplete={() => setStep("done")} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
