import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";

interface EmailInputFormProps {
  initialEmail?: string;
  mustUseDomain?: string;
  onSubmit: (email: string) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  //** If false, the label and iconwill not be shown */
  showLabel?: boolean;
}

export function EmailInputForm({
  initialEmail = "",
  mustUseDomain,
  onSubmit,
  submitLabel = "Submit",
  disabled = false,
  showLabel = true,
}: EmailInputFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { doesUserExist } = useUserStatsStore(); // Extra validation logic to check if the user already exists

  async function validateEmail(email: string): Promise<string | null> {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (mustUseDomain && !email.endsWith(`@${mustUseDomain}`)) {
      return `Email must end with @${mustUseDomain}`;
    }
    if (await doesUserExist(email)) {
      return "User already exists.";
    }
    return null;
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(await validateEmail(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = await validateEmail(email.trim());
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {showLabel && (
          <Label className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </Label>
        )}
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleChange}
          required
          disabled={isSubmitting || disabled}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!!error || !email.trim() || isSubmitting || disabled}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
