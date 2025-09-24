"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmailSetup } from "./EmailSetup";
import { EMA_DOMAIN } from "@/types/constants";
import { motion, AnimatePresence } from "framer-motion";
import { NameSetup } from "./NameSetup";
import { useSidebarStore } from "../components/sidebar/store";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { SUCCESS_DELAY } from "./constants";
import PermissionsSetup from "./PermissionsSetup";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import { useSetupStore } from "./hooks/useSetupStore";
import useSetupSubmit from "./hooks/useSetupSubmit";
import SetupError from "./SetupError";

export default function SetupPage() {
  const { isOpen, setIsOpen } = useSidebarStore();
  const { user, isLoading, registerUser, registerAdminUser } =
    useUserPermissions();
  const userName = user?.name;
  const disciplines = user?.disciplines;
  const router = useRouter();

  const { step, setStep, error, setError } = useSetupStore();
  const { submit } = useSetupSubmit();

  useEffect(() => {
    console.log("SetupPage: useEffect triggered with:", {
      userName,
      user,
    });
    const hasDisciplines = disciplines && disciplines.length > 0;

    if (!userName) {
      console.log("SetupPage: No userName, setting step to name");
      setIsOpen(false);
      setStep("name");
    } else if (!hasDisciplines) {
      console.log(
        "SetupPage: user is falsy (user doesn't exist), setting step to permissions"
      );
      setStep("permissions");
    } else if (userName && hasDisciplines) {
      console.log("SetupPage: All conditions met, setting step to done");
      setStep("done");
    }
  }, [userName, user, setIsOpen, isLoading]);

  useEffect(() => {
    if (step === "done") {
      const run = async () => {
        // Try to register the user
        try {
          await submit();
          setTimeout(() => {
            router.replace("/dashboard");
          }, SUCCESS_DELAY);
        } catch (error) {
          console.warn("SetupPage: Error submitting setup:", error);
          setError("Could not register user. Please try again.");
        }
      };
      run();
    }
  }, [step, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full items-center justify-center p-8 pb-20 sm:p-20"
    >
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            <SetupError />
          </motion.div>
        ) : (
          step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full"
            >
              <NameSetup onComplete={() => setStep("permissions")} />
            </motion.div>
          )
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
