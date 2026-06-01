"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DetailedError {
  message: string;
  details: string;
}

export default function Home() {
  const router = useRouter();
  const { ensureConnectedToServer } = getTauriCommands();

  const [error, setError] = useState<DetailedError | null>(null);

  useEffect(() => {
    const checkConnectedToServer = async () => {
      try {
        await ensureConnectedToServer();
        // throw new Error("Failed to connect to server");
        console.log("Connected to server");
        router.push("/dashboard/installed");
      } catch (error) {
        console.warn("Failed to connect to server", error);
        setError({
          message: "Failed to connect to server",
          details:
            "Either the network drives are not available or you are trying to connect from a non-work computer, which is currently unsupported.",
        });
      }
    };
    checkConnectedToServer();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="flex h-[400px] w-[400px] flex-col items-center justify-center rounded-lg shadow-lg gap-4 bg-background">
        <Image
          src="/images/emavector.svg"
          alt="Logo"
          width={200}
          height={200}
        />
        {error ? (
          <>
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
          </>
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
