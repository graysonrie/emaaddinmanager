"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface DetailedError {
  message: string;
  details: string;
}

type ConnectionView = "connecting" | "sign_in_required" | "error";

function isSignInRequired(error: unknown): boolean {
  return String(error).includes("Microsoft sign-in required");
}

export default function Home() {
  const router = useRouter();
  const { signInWithMicrosoft } = getTauriCommands();

  const [view, setView] = useState<ConnectionView>("connecting");
  const [error, setError] = useState<DetailedError | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const attemptConnection = async () => {
    const { ensureConnectedToServer, updateUserAppVersionMetadata } =
      getTauriCommands();
    setView("connecting");
    setError(null);

    try {
      await ensureConnectedToServer();
      updateUserAppVersionMetadata().catch((updateError) =>
        console.warn("Failed to update app version metadata:", updateError),
      );
      router.push("/dashboard/installed");
    } catch (err) {
      console.warn("Failed to connect to server", err);

      if (isSignInRequired(err)) {
        setView("sign_in_required");
        return;
      }

      setView("error");
      setError({
        message: "Failed to connect to server",
        details: `Either the network drives are not available or you are trying to connect from a non-work computer, which is currently unsupported. Full error: ${err}`,
      });
    }
  };

  useEffect(() => {
    void attemptConnection();
    // The launch check should run once when this screen is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      await signInWithMicrosoft();
      await attemptConnection();
    } catch (err) {
      console.warn("Microsoft sign-in failed", err);
      setSignInError(String(err));
      setView("sign_in_required");
    } finally {
      setIsSigningIn(false);
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
        {view === "sign_in_required" ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-md font-sans text-primary">
                Sign in with your work account
              </p>
              <p className="text-sm font-sans text-muted-foreground">
                {isSigningIn
                  ? "Complete sign-in in your browser, then return here."
                  : "Microsoft sign-in opens in your browser."}
              </p>
            </div>
            {signInError ? (
              <p className="text-sm font-sans text-destructive text-center">
                {signInError}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="animate-spin" />
                  Waiting for Microsoft...
                </>
              ) : (
                "Sign in with Microsoft"
              )}
            </Button>
          </div>
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
            <Button type="button" variant="outline" onClick={() => void attemptConnection()}>
              Try again
            </Button>
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
