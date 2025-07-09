import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

type ButtonVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
interface Props {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: () => void;
  title: string;
  message: string;
  okButtonText?: string;
  okButtonVariant?:ButtonVariant;
  cancelButtonText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

export default function MessageDialog({
  isOpen,
  setIsOpen,
  onClose,
  title,
  message,
  okButtonText,
  okButtonVariant,
  cancelButtonText,
  onOk,
  onCancel,
}: Props) {
  const close = () => {
    setIsOpen?.(false);
    onClose?.();
  };
  const handleOk = () => {
    onOk?.();
    close();
  };
  const handleCancel = () => {
    onCancel?.();
    close();
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
          <div className="flex gap-2 flex-col w-full">
            <Button onClick={handleOk} className="w-full" variant={okButtonVariant ?? "outline"}>
              {okButtonText ?? "Ok"}
            </Button>
          {cancelButtonText && (
            <Button onClick={handleCancel} className="w-full" variant="outline">
              {cancelButtonText}
            </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
