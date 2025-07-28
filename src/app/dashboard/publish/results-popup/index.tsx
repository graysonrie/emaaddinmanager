import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ErrorList } from "@/types/error-list";
import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
  title: string;
  message: string;
  buildResult?: string;
  errorsList?: ErrorList;
}

export default function ResultsPopup({
  isOpen,
  setIsOpen,
  onClose,
  title,
  message,
  buildResult,
  errorsList,
}: Props) {
  const close = () => {
    setIsOpen?.(false);
    onClose?.();
  };
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <DialogDescription>{message}</DialogDescription>
              {buildResult && (
                <div>
                  <DialogDescription>Build Result:</DialogDescription>
                  <DialogDescription>{buildResult}</DialogDescription>
                </div>
              )}
              {errorsList && (
                <div className="flex flex-col gap-2">
                  {errorsList.errors.length > 0 && (
                    <div>
                      <DialogDescription>Errors:</DialogDescription>
                      <div className="flex flex-col gap-2 p-2">
                        {Array.from(new Set(errorsList.errors)).map((error) => (
                          <Card
                            key={error}
                            className="p-2 flex flex-row items-center gap-2 border-destructive/20 bg-destructive/10"
                          >
                            <FileWarning className="w-4 h-4 text-destructive" />
                            <DialogDescription className="text-sm text-destructive">
                              {error}
                            </DialogDescription>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  {errorsList.warnings.length > 0 && (
                    <div>
                      <DialogDescription>Warnings:</DialogDescription>
                      <div className="flex flex-col gap-2 p-2">
                        {Array.from(new Set(errorsList.warnings)).map(
                          (warning) => (
                            <Card
                              key={warning}
                              className="p-2 flex flex-row items-center gap-2 border-warning/20 bg-warning/10"
                            >
                              <FileWarning className="w-4 h-4 text-warning" />
                              <DialogDescription className="text-sm text-warning">
                                {warning}
                              </DialogDescription>
                            </Card>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Button onClick={close} className="w-full" variant="outline">
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
