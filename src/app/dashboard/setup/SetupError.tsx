import { AlertTriangle, Blocks } from "lucide-react";
import { useSetupStore } from "./hooks/useSetupStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SetupError() {
  const { error, setError, setStep } = useSetupStore();
  const onTryAgain = () => {
    setError(undefined);
    setStep("name");
  };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <AlertTriangle className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Error</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center w-full">
        <Button onClick={onTryAgain} className="w-full">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
