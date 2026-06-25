"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import useConfig from "@/lib/persistence/config/useConfig";
import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DetailedError {
  message: string;
  details: string;
}

type ConnectionView = "connecting" | "api_key_required" | "error";
type ConnectionResult = "success" | "api_key_error" | "other_error";

function isStatsApiKeyError(error: unknown): boolean {
  const message = String(error);
  return (
    message.includes("401") && message.includes("Invalid or missing API key")
  );
}

export default function Home() {
  const router = useRouter();
  const { ensureConnectedToServer, updateUserAppVersionMetadata } =
    getTauriCommands();
  const { update } = useConfig();
  const savedStatsKey = useKeyValueSubscription("statsKey");

  const [view, setView] = useState<ConnectionView>("connecting");
  const [error, setError] = useState<DetailedError | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const hasAttemptedInitialConnection = useRef(false);
  const hasPrefilledApiKeyInput = useRef(false);

  const prefillApiKeyInputIfNeeded = useCallback(() => {
    if (hasPrefilledApiKeyInput.current || !savedStatsKey) {
      return;
    }
    setApiKeyInput(savedStatsKey);
    hasPrefilledApiKeyInput.current = true;
  }, [savedStatsKey]);

  const handleConnectionSuccess = useCallback(() => {
    updateUserAppVersionMetadata().catch((error) =>
      console.warn("Failed to update app version metadata:", error),
    );
    router.push("/dashboard/installed");
  }, [router, updateUserAppVersionMetadata]);

  const attemptConnection = useCallback(async (): Promise<ConnectionResult> => {
    setView("connecting");
    setError(null);

    try {
      await ensureConnectedToServer();
      handleConnectionSuccess();
      return "success";
    } catch (err) {
      console.warn("Failed to connect to server", err);

      if (isStatsApiKeyError(err)) {
        prefillApiKeyInputIfNeeded();
        setView("api_key_required");
        return "api_key_error";
      }

      setView("error");
      setError({
        message: "Failed to connect to server",
        details: `Either the network drives are not available or you are trying to connect from a non-work computer, which is currently unsupported. Full error: ${err}`,
      });
      return "other_error";
    }
  }, [
    ensureConnectedToServer,
    handleConnectionSuccess,
    prefillApiKeyInputIfNeeded,
  ]);

  useEffect(() => {
    if (hasAttemptedInitialConnection.current) {
      return;
    }
    hasAttemptedInitialConnection.current = true;
    void attemptConnection();
  }, [attemptConnection]);

  useEffect(() => {
    if (view === "api_key_required") {
      prefillApiKeyInputIfNeeded();
    }
  }, [view, prefillApiKeyInputIfNeeded]);

  const handleApiKeySubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      setApiKeyError("Please enter an API key.");
      return;
    }

    setIsSavingApiKey(true);
    setApiKeyError(null);

    try {
      await update("statsKey", trimmedKey);
      const result = await attemptConnection();
      if (result === "api_key_error") {
        setApiKeyError("Invalid API key. Please check and try again.");
      }
    } catch (err) {
      console.warn("Failed to save API key", err);
      setApiKeyError(String(err));
      setView("api_key_required");
    } finally {
      setIsSavingApiKey(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex min-h-[400px] w-[400px] flex-col items-center justify-center rounded-lg shadow-lg gap-4 bg-background px-6 py-6">
        <Image
          src="/images/emavector.svg"
          alt="Logo"
          width={200}
          height={200}
        />
        {view === "api_key_required" ? (
          <form
            onSubmit={handleApiKeySubmit}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <p className="text-md font-sans text-primary">
                  External server API key required
                </p>
              </div>
              <p className="text-sm font-sans text-muted-foreground">
                Enter the API key provided by your administrator to connect to
                the server.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="stats-api-key">API key</Label>
              <Input
                id="stats-api-key"
                type="password"
                autoComplete="off"
                value={apiKeyInput}
                onChange={(event) => setApiKeyInput(event.target.value)}
                disabled={isSavingApiKey}
                aria-invalid={apiKeyError != null}
                placeholder="ema_..."
              />
              {apiKeyError ? (
                <p className="text-sm font-sans text-destructive">
                  {apiKeyError}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={isSavingApiKey} className="w-full">
              {isSavingApiKey ? (
                <>
                  <Loader2 className="animate-spin" />
                  Connecting...
                </>
              ) : (
                "Save and connect"
              )}
            </Button>
          </form>
        ) : view === "error" && error ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-md font-sans text-destructive">
                  {error.message}
                </p>
              </div>
              <p className="text-sm font-sans text-destructive text-center">
                {error.details}
              </p>
            </div>
            <div className="flex flex-row text-left gap-1 text-sans text-muted-foreground">
              <p>If the issue persists, please contact</p>
              <a
                href="mailto:grieger@emaengineer.com"
                className="text-primary underline"
              >
                the maintainer
              </a>
            </div>
          </div>
        ) : (
          <>
            <p className="text-md font-sans text-primary">
              Establishing connection to server...
            </p>
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </>
        )}
      </div>
    </div>
  );
}
