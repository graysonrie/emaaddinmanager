import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useEffect, useState } from "react";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { TEMP_PASSWORD } from "@/types/constants";

export default function usePasswordCheck() {
  const [isPasswordSetForSelf, setIsPasswordSetForSelf] = useState<
    boolean | null
  >(null);
  const [isTempPassword, setIsTempPassword] = useState<boolean | null>(null);
  const [justSetPassword, setJustSetPassword] = useState(false);
  const [isCheckingPasswordSet, setIsCheckingPasswordSet] = useState(true);
  const userEmail = useKeyValueSubscription<string>("userEmail");
  const {
    loginCheckIfPasswordIsSetForSelf,
    loginSetPassword,
    loginVerifyPasswordForUser,
  } = getTauriCommands();

  const checkPasswordSetForSelf = async () => {
    setIsCheckingPasswordSet(true);
    try {
      const result = await loginCheckIfPasswordIsSetForSelf();
      setIsPasswordSetForSelf(result);
    } catch (error) {
      console.error("Failed to check if password is set for self:", error);
      setIsPasswordSetForSelf(false);
    } finally {
      setIsCheckingPasswordSet(false);
    }
  };

  useEffect(() => {
    checkPasswordSetForSelf();
  }, []);

  // Also check password status when email becomes available (for users logging in with temp password)
  useEffect(() => {
    if (userEmail) {
      checkPasswordSetForSelf();
    }
  }, [userEmail]);

  // Check if current password is the temp password
  useEffect(() => {
    // Skip the check if we just set a password (we already know it's not temp)
    if (justSetPassword) {
      return;
    }

    const checkTempPassword = async () => {
      if (!userEmail || !isPasswordSetForSelf) {
        setIsTempPassword(null);
        return;
      }

      try {
        const isTemp = await loginVerifyPasswordForUser(
          userEmail,
          TEMP_PASSWORD
        );
        setIsTempPassword(isTemp);
      } catch (err) {
        console.error("Failed to check if password is temp:", err);
        setIsTempPassword(false);
      }
    };

    if (isPasswordSetForSelf === true && userEmail) {
      checkTempPassword();
    } else {
      setIsTempPassword(null);
    }
    // loginVerifyPasswordForUser is stable from getTauriCommands, so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, isPasswordSetForSelf, justSetPassword]);

  async function setPassword(password: string) {
    await loginSetPassword(password);
    // Set flag to prevent temp password check from running immediately
    setJustSetPassword(true);
    // Automatically refresh the state after setting password
    const result = await loginCheckIfPasswordIsSetForSelf();
    setIsPasswordSetForSelf(result);
    setIsCheckingPasswordSet(false);
    // Since the form validation prevents using TEMP_PASSWORD, we know the new password is NOT temp
    // Set it to false immediately so the UI can proceed without waiting for async check
    setIsTempPassword(false);
    // Clear the flag after a short delay to allow normal checks to resume
    setTimeout(() => {
      setJustSetPassword(false);
    }, 1000);
  }

  async function checkIsPasswordIsSet() {
    await checkPasswordSetForSelf();
  }

  return {
    isPasswordSetForSelf,
    isCheckingPasswordSet,
    isTempPassword,
    setPassword,
    checkIsPasswordIsSet,
  };
}
