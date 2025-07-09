import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DisciplinesSelectorFormProps {
  onSubmit: (disciplines: string[]) => void;
  submitLabel: string;
}

// Common engineering disciplines
const DISCIPLINES = [
  "Architecture",
  "Structural Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Plumbing Engineering",
  "HVAC Engineering",
  "Civil Engineering",
  "Landscape Architecture",
  "Interior Design",
  "Construction Management",
  "Project Management",
  "BIM Management",
  "Sustainability",
  "Fire Protection",
  "Acoustics",
  "Lighting Design",
  "Geotechnical Engineering",
  "Transportation Engineering",
  "Environmental Engineering",
  "Energy Engineering",
  "Commissioning / Consulting",
];

export default function DisciplinesSelectorForm({
  onSubmit,
  submitLabel,
}: DisciplinesSelectorFormProps) {
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);

  const handleDisciplineToggle = (discipline: string, checked: boolean) => {
    if (checked) {
      setSelectedDisciplines((prev) => [...prev, discipline]);
    } else {
      setSelectedDisciplines((prev) => prev.filter((d) => d !== discipline));
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedDisciplines);
  };

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      {/* Header - Fixed at top */}
      <div className="space-y-2 mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium">Select Your Disciplines</h3>
        <p className="text-sm text-muted-foreground">
          Choose all the engineering disciplines that apply to your work.
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Card className="h-full">
          <CardContent className="pt-6 h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {DISCIPLINES.map((discipline) => (
                <div key={discipline} className="flex items-center space-x-2">
                  <Checkbox
                    id={discipline}
                    checked={selectedDisciplines.includes(discipline)}
                    onCheckedChange={(checked) =>
                      handleDisciplineToggle(discipline, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={discipline}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {discipline}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex justify-between items-center mt-4 flex-shrink-0">
        <p className="text-sm text-muted-foreground">
          {selectedDisciplines.length} discipline
          {selectedDisciplines.length !== 1 ? "s" : ""} selected
        </p>
        <Button
          onClick={handleSubmit}
          disabled={selectedDisciplines.length === 0}
          className="min-w-[100px]"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
