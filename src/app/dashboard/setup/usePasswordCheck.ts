import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useEffect } from "react";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { TEMP_PASSWORD } from "@/types/constants";
import { usePasswordCheckStore } from "./passwordCheckStore";

function hasCachedPasswordCheck(
  userEmail: string | undefined,
  cachedEmail: string | null,
  isPasswordSetForSelf: boolean | null,
): boolean {
  return (
    Boolean(userEmail) &&
    userEmail === cachedEmail &&
    isPasswordSetForSelf !== null
  );
}

export default function usePasswordCheck() {
  const userEmail = useKeyValueSubscription("userEmail");
  const {
    cachedEmail,
    isPasswordSetForSelf,
    isTempPassword,
    isChecking,
    justSetPassword,
    setChecking,
    setPasswordSetResult,
    setTempPassword,
    setJustSetPassword,
    reset,
  } = usePasswordCheckStore();
  const {
    loginCheckIfPasswordIsSetForSelf,
    loginSetPassword,
    loginVerifyPasswordForUser,
  } = getTauriCommands();

  const isCheckingPasswordSet =
    isChecking ||
    (Boolean(userEmail) &&
      !hasCachedPasswordCheck(userEmail, cachedEmail, isPasswordSetForSelf));

  const checkPasswordSetForSelf = async (force = false) => {
    if (
      !force &&
      hasCachedPasswordCheck(userEmail, cachedEmail, isPasswordSetForSelf)
    ) {
      return;
    }

    if (!force && usePasswordCheckStore.getState().isChecking) {
      return;
    }

    setChecking(true);
    try {
      const result = await loginCheckIfPasswordIsSetForSelf();
      setPasswordSetResult(userEmail ?? null, result);
    } catch (error) {
      console.error("Failed to check if password is set for self:", error);
      setPasswordSetResult(userEmail ?? null, false);
    }
  };

  useEffect(() => {
    if (!userEmail) {
      reset();
      return;
    }

    if (userEmail !== cachedEmail) {
      setPasswordSetResult(userEmail, null);
      setTempPassword(null);
    }

    checkPasswordSetForSelf();
    // Only re-run when the signed-in user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  useEffect(() => {
    if (justSetPassword) {
      return;
    }

    const checkTempPassword = async () => {
      if (!userEmail || !isPasswordSetForSelf) {
        setTempPassword(null);
        return;
      }

      if (
        userEmail === cachedEmail &&
        isTempPassword !== null &&
        isPasswordSetForSelf === true
      ) {
        return;
      }

      try {
        const isTemp = await loginVerifyPasswordForUser(
          userEmail,
          TEMP_PASSWORD,
        );
        setTempPassword(isTemp);
      } catch (err) {
        console.error("Failed to check if password is temp:", err);
        setTempPassword(false);
      }
    };

    if (isPasswordSetForSelf === true && userEmail) {
      checkTempPassword();
    } else {
      setTempPassword(null);
    }
    // loginVerifyPasswordForUser is stable from getTauriCommands, so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail, isPasswordSetForSelf, justSetPassword, cachedEmail]);

  async function setPassword(password: string) {
    await loginSetPassword(password);
    setJustSetPassword(true);
    const result = await loginCheckIfPasswordIsSetForSelf();
    setPasswordSetResult(userEmail ?? null, result);
    setTempPassword(false);
    setTimeout(() => {
      setJustSetPassword(false);
    }, 1000);
  }

  async function checkIsPasswordIsSet() {
    await checkPasswordSetForSelf(true);
  }

  return {
    isPasswordSetForSelf,
    isCheckingPasswordSet,
    isTempPassword,
    setPassword,
    checkIsPasswordIsSet,
  };
}
