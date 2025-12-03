import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Mail, User } from "lucide-react";
import { TEMP_PASSWORD } from "@/types/constants";

interface PasswordInputFormProps {
  onSubmit: (password: string, retypedPassword: string) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  //** If false, the label and iconwill not be shown */
  showLabel?: boolean;
}

export function PasswordInputForm({
  onSubmit,
  submitLabel = "Submit",
  disabled = false,
  showLabel = true,
}: PasswordInputFormProps) {
  const [password, setPassword] = useState("");
  const [retypedPassword, setRetypedPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validatePassword(
    password: string,
    retypedPassword: string
  ): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password !== retypedPassword) {
      return "Passwords do not match";
    }
    if (password === TEMP_PASSWORD) {
      return "Password cannot be the same as the temporary password";
    }
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(validatePassword(e.target.value, retypedPassword));
  };

  const handleRetypedPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRetypedPassword(e.target.value);
    setError(validatePassword(password, e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validatePassword(
      password.trim(),
      retypedPassword.trim()
    );
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(password.trim(), retypedPassword.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {showLabel && (
          <Label className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Password</span>
          </Label>
        )}
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handleChange}
          required
          disabled={isSubmitting || disabled}
        />
        {showLabel && (
          <Label className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Retype Password</span>
          </Label>
        )}
        <Input
          id="retyped-password"
          type="password"
          placeholder="Retype your password"
          value={retypedPassword}
          onChange={handleRetypedPasswordChange}
          required
          disabled={isSubmitting || disabled}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={
          !!error ||
          !password.trim() ||
          !retypedPassword.trim() ||
          isSubmitting ||
          disabled
        }
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
