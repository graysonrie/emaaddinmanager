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
import PermissionsSetup from "./PermissionsSetup";
import useUserPermissions from "@/lib/persistence/useUserPermissions";
import { PasswordSetup } from "./PasswordSetup";
import usePasswordCheck from "./usePasswordCheck";
import { useSetupStore } from "./store";

export default function SetupPage() {
  const {
    isPasswordSetForSelf,
    isCheckingPasswordSet,
    isTempPassword,
    checkIsPasswordIsSet,
  } = usePasswordCheck();
  const userEmail = useKeyValueSubscription("userEmail");
  const userName = useKeyValueSubscription("userName");
  const { isOpen, setIsOpen } = useSidebarStore();
  const { forcePasswordChange, setForcePasswordChange } = useSetupStore();
  const [step, setStep] = useState<
    "email" | "name" | "permissions" | "password" | "done"
  >("email");
  const { user, isLoading } = useUserPermissions();
  const router = useRouter();

  useEffect(() => {
    console.log("SetupPage: useEffect triggered with:", {
      userEmail,
      userName,
      user,
      isTempPassword,
      isPasswordSetForSelf,
      forcePasswordChange,
      currentStep: step,
    });

    // If we're currently on the password step, don't change it unless we're absolutely sure
    // the password is properly set and NOT a temp password
    if (step === "password") {
      // Don't leave password step until we know for sure it's not temp password
      if (isPasswordSetForSelf && isTempPassword === null) {
        console.log(
          "SetupPage: On password step, waiting for temp password check"
        );
        return;
      }
      // Only leave password step if password is set AND confirmed NOT temp password
      if (
        isPasswordSetForSelf &&
        isTempPassword === false &&
        !forcePasswordChange
      ) {
        console.log(
          "SetupPage: Password is set and not temp, proceeding to done"
        );
        setStep("done");
        return;
      }
      // If still temp password or forced change, stay on password step
      if (isTempPassword === true || forcePasswordChange) {
        console.log(
          "SetupPage: Still need to change temp password, staying on password step"
        );
        return;
      }
    }

    // Don't make routing decisions until we know the password status
    if (isCheckingPasswordSet) {
      console.log("SetupPage: Waiting for password status check to complete");
      return;
    }
    // If password is set, wait for temp password check to complete (isTempPassword !== null)
    if (isPasswordSetForSelf === true && isTempPassword === null) {
      console.log("SetupPage: Waiting for temp password check to complete");
      return;
    }

    // Step 1: Check for email
    if (!userEmail) {
      console.log("SetupPage: No userEmail, setting step to email");
      setIsOpen(false);
      setStep("email");
      return;
    }

    // Step 2: Check for name
    if (!userName) {
      console.log("SetupPage: No userName, setting step to name");
      setIsOpen(false);
      setStep("name");
      return;
    }

    // Step 3: Check for user registration (permissions) - only for NEW users
    // If user already exists (user is truthy), skip permissions
    if (!user && !isLoading) {
      console.log(
        "SetupPage: user is falsy (user doesn't exist), setting step to permissions"
      );
      setStep("permissions");
      return;
    }

    // If user exists, skip permissions and go straight to password check
    // Step 4: Check for password - if no password OR temp password, go to password step
    if (
      isPasswordSetForSelf !== true ||
      isTempPassword === true ||
      forcePasswordChange
    ) {
      if (userEmail && userName) {
        // Go to password if we have email and name (user may or may not exist)
        console.log(
          "SetupPage: Password check needed - isPasswordSetForSelf:",
          isPasswordSetForSelf,
          "isTempPassword:",
          isTempPassword,
          "forcePasswordChange:",
          forcePasswordChange,
          "user exists:",
          !!user
        );
        setIsOpen(false);
        setStep("password");
        return;
      }
    }

    // Step 5: All done - only if password is set and NOT temp password
    // User may or may not exist (existing users skip permissions)
    if (
      userEmail &&
      userName &&
      isPasswordSetForSelf === true &&
      isTempPassword === false &&
      !forcePasswordChange
    ) {
      console.log("SetupPage: All conditions met, setting step to done");
      setStep("done");
    }
  }, [
    userEmail,
    userName,
    user,
    setIsOpen,
    isLoading,
    isPasswordSetForSelf,
    isCheckingPasswordSet,
    isTempPassword,
    forcePasswordChange,
    step, // Add step to dependencies to check current step
  ]);

  useEffect(() => {
    if (step === "done") {
      // Clear the forced password change flag when done
      setForcePasswordChange(false);
      setTimeout(() => {
        router.replace("/dashboard/installed");
      }, SUCCESS_DELAY);
      return;
    }
  }, [step, router, setForcePasswordChange]);

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
            <NameSetup onComplete={() => setStep("permissions")} />
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
            <PermissionsSetup
              onComplete={() => {
                // After permissions, check if password needs to be set/changed
                // The useEffect will handle routing to password or done
                checkIsPasswordIsSet();

                setStep("password");
              }}
            />
          </motion.div>
        )}
        {step === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full"
          >
            <PasswordSetup
              onComplete={() => {
                // setPassword already updates isPasswordSetForSelf and isTempPassword state
                // Clear the forced change flag - the useEffect will detect the state changes
                // and route to "done" when password is set and not temp
                setForcePasswordChange(false);
                // The useEffect will automatically detect the state changes and proceed
                setStep("done");
              }}
              isForcedChange={forcePasswordChange || isTempPassword === true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
