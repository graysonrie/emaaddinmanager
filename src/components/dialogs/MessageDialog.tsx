import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface Props {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
  title: string;
  message: string;
  okButtonText?: string;
}

export default function MessageDialog({
  isOpen,
  setIsOpen,
  onClose,
  title,
  message,
  okButtonText,
}: Props) {
  const close = () => {
    setIsOpen?.(false);
    onClose?.();
  };
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>
          <DialogDescription>{message}</DialogDescription>
        </div>
        <DialogFooter>
          <Button onClick={close} className="w-full" variant="outline">
            {okButtonText ?? "Ok"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
