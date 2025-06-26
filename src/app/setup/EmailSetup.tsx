"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CheckCircle, Blocks } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { EmailInputForm } from "@/components/EmailInputForm";

interface EmailSetupProps {
  onComplete: () => void;
  mustUseDomain?: string;
}

export function EmailSetup({ onComplete, mustUseDomain }: EmailSetupProps) {
  const [isComplete, setIsComplete] = useState(false);
  const { update } = useConfig();

  const handleEmailSubmit = async (email: string) => {
    await update("userEmail", email);
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Email Saved!</h3>
              <p className="text-sm text-muted-foreground">
                Welcome to EMA Addin Manager
              </p>
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
          <Blocks className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Welcome to the EMA Revit Addin Manager</CardTitle>
        <CardDescription>
          Please enter your work email address to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmailInputForm
          mustUseDomain={mustUseDomain}
          onSubmit={handleEmailSubmit}
          submitLabel="Get Started"
        />
      </CardContent>
    </Card>
  );
}
