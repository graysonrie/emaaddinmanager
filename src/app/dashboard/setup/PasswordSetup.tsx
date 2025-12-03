"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SUCCESS_DELAY } from "./constants";
import { CheckCircle, Blocks, Lock } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { EmailInputForm } from "@/components/EmailInputForm";
import { NameInputForm } from "@/components/NameInputForm";
import usePasswordCheck from "./usePasswordCheck";
import { PasswordInputForm } from "@/components/PasswordInputForm";
import { TEMP_PASSWORD } from "@/types/constants";

interface PasswordSetupProps {
  onComplete: () => void;
  isForcedChange?: boolean;
}

export function PasswordSetup({
  onComplete,
  isForcedChange = false,
}: PasswordSetupProps) {
  const [isComplete, setIsComplete] = useState(false);
  const { update } = useConfig();
  const { setPassword } = usePasswordCheck();

  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = async (
    password: string,
    retypedPassword: string
  ) => {
    try {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (password !== retypedPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password === TEMP_PASSWORD) {
        setError("Password cannot be the same as the temporary password");
        return;
      }
      await setPassword(password);
      setIsComplete(true);
      // Wait a bit for state to propagate, then call onComplete
      setTimeout(() => {
        onComplete();
      }, SUCCESS_DELAY);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Password Saved!</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>
          {isForcedChange ? "Change Password Required" : "Password Setup"}
        </CardTitle>
        <CardDescription className="text-destructive text-sm italic font-semibold">
          {isForcedChange
            ? "Your temporary password must be changed. Please enter a new password you do not use for any other accounts."
            : "For security reasons, please enter a password you do not use for any other accounts"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordInputForm onSubmit={handlePasswordSubmit} submitLabel="Next" />
      </CardContent>
    </Card>
  );
}
