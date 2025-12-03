import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Key } from "lucide-react";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";

interface EmailInputFormProps {
  initialEmail?: string;
  mustUseDomain?: string;
  onSubmit: (email: string) => Promise<void>;
  submitLabel?: string;
  disabled?: boolean;
  //** If false, the label and iconwill not be shown */
  showLabel?: boolean;
  //** Callback to verify password for existing users. Returns true if password is correct */
  onPasswordVerify?: (email: string, password: string) => Promise<boolean>;
}

export function EmailInputForm({
  initialEmail = "",
  mustUseDomain,
  onSubmit,
  submitLabel = "Submit",
  disabled = false,
  showLabel = true,
  onPasswordVerify,
}: EmailInputFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const { doesUserExist } = useUserStatsStore(); // Extra validation logic to check if the user already exists

  async function validateEmail(email: string): Promise<string | null> {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (mustUseDomain && !email.endsWith(`@${mustUseDomain}`)) {
      return `Email must end with @${mustUseDomain}`;
    }
    const exists = await doesUserExist(email);
    setUserExists(exists);
    if (exists && !onPasswordVerify) {
      return "User already exists. Password verification is required but not configured.";
    }
    return null;
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setPassword(""); // Clear password when email changes
    setPasswordError(null);
    setError(await validateEmail(e.target.value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = await validateEmail(email.trim());
    setError(validationError);
    if (validationError) return;

    // If user exists, verify password first
    if (userExists && onPasswordVerify) {
      if (!password.trim()) {
        setPasswordError("Password is required for existing users.");
        return;
      }

      setIsSubmitting(true);
      try {
        const isValid = await onPasswordVerify(email.trim(), password.trim());
        if (!isValid) {
          setPasswordError("Incorrect password. Please try again.");
          setIsSubmitting(false);
          return;
        }
        // Password is correct, proceed with email submission
      } catch (err) {
        setPasswordError(
          err instanceof Error ? err.message : "Failed to verify password."
        );
        setIsSubmitting(false);
        return;
      }
    }

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
        {userExists && !error && (
          <p className="text-muted-foreground text-sm">
            This email is already registered. Please enter your password to
            continue.
          </p>
        )}
      </div>
      {userExists && onPasswordVerify && (
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
            onChange={handlePasswordChange}
            required
            disabled={isSubmitting || disabled}
          />
          {passwordError && (
            <p className="text-destructive text-sm">{passwordError}</p>
          )}
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={
          !!error ||
          !email.trim() ||
          (userExists && !password.trim()) ||
          isSubmitting ||
          disabled
        }
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
