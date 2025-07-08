"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CheckCircle, BriefcaseBusiness } from "lucide-react";
import useConfig from "@/lib/persistence/config/useConfig";
import { SUCCESS_DELAY } from "./constants";
import DisciplinesSelectorForm from "@/components/DisciplinesSelectorForm";

interface DisciplineSetupProps {
  onComplete: () => void;
}

export function DisciplineSetup({ onComplete }: DisciplineSetupProps) {
  const [isComplete, setIsComplete] = useState(false);
  const { update } = useConfig();

  const handleDisciplineSubmit = async (disciplines: string[]) => {
    await update("userDisciplines", disciplines);
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, SUCCESS_DELAY);
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Disciplines Saved!</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto h-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <BriefcaseBusiness className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>One more thing...</CardTitle>
      </CardHeader>
      <CardContent>
          <DisciplinesSelectorForm
            onSubmit={handleDisciplineSubmit}
            submitLabel="Next"
          />
      </CardContent>
    </Card>
  );
}
