
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, User } from "lucide-react";

interface NameInputFormProps {
  initialName?: string;
  onSubmit: (name: string) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  //** If false, the label and iconwill not be shown */
  showLabel?: boolean;
}

export function NameInputForm({
  initialName = "",
  onSubmit,
  submitLabel = "Submit",
  disabled = false,
  showLabel = true,
}: NameInputFormProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateName(name: string): string | null {
    const nameRegex = /^[a-zA-Z0-9]+$/;
    if (!nameRegex.test(name)) {
      return "Please enter a valid name.";
    }
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(validateName(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateName(name.trim());
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {showLabel && (
          <Label className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Name</span>
          </Label>
        )}
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={handleChange}
          required
          disabled={isSubmitting || disabled}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!!error || !name.trim() || isSubmitting || disabled}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
