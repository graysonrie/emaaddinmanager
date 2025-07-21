"use client";

import { useState, useEffect } from "react";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { useRouter } from "next/navigation";
import { EmailSetup } from "./EmailSetup";
import { UserSettings } from "../settings/UserSettings";
import { EMA_DOMAIN } from "@/types/constants";
import { motion, AnimatePresence } from "framer-motion";
import { NameSetup } from "./NameSetup";
import { useSidebarStore } from "../components/sidebar/store";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { SUCCESS_DELAY } from "./constants";
import { DisciplineSetup } from "./DisciplineSetup";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { UserModel } from "@/lib/models/user.model";
import PermissionsSetup from "./PermissionsSetup";

export default function SetupPage() {
  const userEmail = useKeyValueSubscription<string>("userEmail");
  const userName = useKeyValueSubscription<string>("userName");
  const { isOpen, setIsOpen } = useSidebarStore();
  const [step, setStep] = useState<"email" | "name" | "permissions" | "done">("email");
  const [user, setUser] = useState<UserModel | undefined | null>(null); // Replace 'any' with your user type
  const router = useRouter();

  // Fetch user when userEmail changes
  useEffect(() => {
    if (userEmail) {
      getTauriCommands().getUser(userEmail).then(setUser);
    } else {
      setUser(undefined);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      setIsOpen(false);
      setStep("email");
    } else if (!userName) {
      setIsOpen(false);
      setStep("name");
    } else if (user === null) {
      // Still loading user, do nothing
    } else if (!user) {
      setStep("permissions");
    } else if (userEmail && userName && user) {
      setStep("done");
    }
  }, [userEmail, userName, user, setIsOpen]);

  useEffect(() => {
    if (step === "done") {
      setTimeout(() => {
        router.replace("/dashboard");
      }, SUCCESS_DELAY);
      return;
    }
  }, [step, router]);

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
        {
          step === "permissions" && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full"
            >
              <PermissionsSetup />
            </motion.div>
          )
        }
      </AnimatePresence>
    </motion.div>
  );
}
