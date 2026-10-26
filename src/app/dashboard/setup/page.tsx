"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NameSetup } from "./NameSetup";
import { useSidebarStore } from "../components/sidebar/store";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { SUCCESS_DELAY } from "./constants";
import PermissionsSetup from "./PermissionsSetup";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  const userEmail = useKeyValueSubscription("userEmail");
  const userName = useKeyValueSubscription("userName");
  const { setIsOpen } = useSidebarStore();
  const [step, setStep] = useState<
    "loading" | "missing-email" | "name" | "permissions" | "done"
  >("loading");
  const { user, isLoading } = useUserPermissions();
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) {
      setIsOpen(false);
      setStep("missing-email");
      return;
    }

    if (!userName) {
      setIsOpen(false);
      setStep("name");
      return;
    }

    if (step === "name") {
      return;
    }

    if (isLoading) {
      return;
    }

    if (!user) {
      setIsOpen(false);
      setStep("permissions");
      return;
    }

    setStep("done");
  }, [userEmail, userName, user, isLoading, setIsOpen, step]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }
    const timer = setTimeout(() => {
      router.replace("/dashboard/installed");
    }, SUCCESS_DELAY);
    return () => clearTimeout(timer);
  }, [step, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full items-center justify-center p-8 pb-20 sm:p-20"
    >
      <AnimatePresence mode="wait">
        {step === "missing-email" && (
          <motion.div
            key="missing-email"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex w-full max-w-md flex-col items-center gap-4 text-center"
          >
            <p className="text-md font-sans text-primary">
              Sign in before setting up this computer.
            </p>
            <Button type="button" onClick={() => router.replace("/")}>
              Back to sign in
            </Button>
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
            <NameSetup
              onComplete={() => setStep(user ? "done" : "permissions")}
            />
          </motion.div>
        )}
        {step === "permissions" && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            <PermissionsSetup onComplete={() => setStep("done")} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
