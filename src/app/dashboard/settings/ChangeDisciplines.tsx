"use client";

import DisciplinesSelectorForm from "@/components/DisciplinesSelectorForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useConfig from "@/lib/persistence/config/useConfig";
import { BriefcaseBusiness } from "lucide-react";
import { useState } from "react";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";

export default function ChangeDisciplines() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { update } = useConfig();

  const currentDisciplines = useKeyValueSubscription<string[]>("userDisciplines");

  const handleUpdateDisciplines = async (disciplines: string[]) => {
    await update("userDisciplines", disciplines);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
        <Label className="text-base font-medium">Disciplines</Label>
      </div>

      <div className="pl-6">
        {isEditing ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Update your disciplines
            </p>
            <DisciplinesSelectorForm
              onSubmit={handleUpdateDisciplines}
              submitLabel="Save Changes"
              showLabel={false}
              initialDisciplines={currentDisciplines || []}
            />
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium flex flex-wrap gap-2">
                {currentDisciplines?.map((discipline) => {
                  return <div key={discipline} className="bg-muted rounded-md px-2 py-1">{discipline}</div>;
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                The engineering disciplines you are involved in
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
