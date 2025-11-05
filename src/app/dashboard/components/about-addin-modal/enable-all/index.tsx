import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { useEffect, useState } from "react";
import { useEnableAllAddinModalStore } from "./enable-all-modal-store";
import {
  CheckCircle2,
  Hammer,
  Loader2,
  SquaresExclude,
  XCircle,
} from "lucide-react";
import useManageAddins from "./useManageAddins";

export default function EnableAllModal() {
  const { isOpen, __setIsOpen, addinModel } = useEnableAllAddinModalStore();

  useEffect(() => {
    if (isOpen) {
      setShowIsEnablingForAllUsers(false);
      setShowIsDisablingForAllUsers(false);
      setSuccessTitle(undefined);
      setSuccessMessage(undefined);
      setShowSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const [showIsEnablingForAllUsers, setShowIsEnablingForAllUsers] =
    useState<boolean>(false);
  const [showIsDisablingForAllUsers, setShowIsDisablingForAllUsers] =
    useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [successTitle, setSuccessTitle] = useState<string | undefined>(
    undefined
  );
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );

  const { enableForAllUsers, disableForAllUsers } = useManageAddins();

  const handleEnableForAllUsers = async () => {
    setLoading(true);
    let successMessage = undefined;
    let successTitle = undefined;
    try {
      await enableForAllUsers();
      successTitle = "Addin enabled for all users";
      successMessage = `The addin ${
        addinModel!.name
      } has been enabled for all users.`;
    } catch (error) {
      successTitle = "Failed to enable addin for all users";
      successMessage = error as string;
    }
    setLoading(false);
    setShowIsEnablingForAllUsers(false);
    setShowSuccess(true);
    setSuccessTitle(successTitle);
    setSuccessMessage(successMessage);
  };

  const handleDisableForAllUsers = async () => {
    setLoading(true);
    let successMessage = undefined;
    let successTitle = undefined;
    try {
      await disableForAllUsers();
      successTitle = "Addin disabled for all users";
      successMessage = `The addin ${
        addinModel!.name
      } has been disabled for all users.`;
    } catch (error) {
      successTitle = "Failed to disable addin for all users";
      successMessage = error as string;
    }
    setLoading(false);
    setShowIsDisablingForAllUsers(false);
    setShowSuccess(true);
    setSuccessTitle(successTitle);
    setSuccessMessage(successMessage);
  };

  if (!addinModel) {
    return (
      <Dialog open={isOpen} onOpenChange={__setIsOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex gap-[6px] items-center">
              I am error
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={__setIsOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center font-sans">
              <Loader2 className="w-6 h-6 shrink-0 animate-spin text-blue-500" />
              Applying changes...
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={__setIsOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center font-sans">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-green-500" />
              {successTitle}
            </DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground text-sm">
              {successMessage}
            </DialogDescription>
            <Button
              variant="default"
              className="w-full"
              onClick={() => __setIsOpen(false)}
            >
              OK
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (showIsEnablingForAllUsers) {
    return (
      <Dialog open={isOpen} onOpenChange={__setIsOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center font-sans">
              <SquaresExclude className="w-6 h-6 shrink-0 text-blue-500" />
              <div className="flex flex-row gap-[6px]">
                <p className="text-lg ">Enable</p>
                <p className="text-lg text-blue-500">{addinModel.name}</p>
                <p className="text-lg ">for all users?</p>
              </div>
            </DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground text-sm">
              This will give all users access to this addin.
            </DialogDescription>
            <Button
              variant="default"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleEnableForAllUsers}
            >
              Enable for all users
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (showIsDisablingForAllUsers) {
    return (
      <Dialog open={isOpen} onOpenChange={__setIsOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center font-sans">
              <SquaresExclude className="w-6 h-6 shrink-0 text-destructive" />
              <div className="flex flex-row gap-[6px]">
                <p className="text-lg ">Disable</p>
                <p className="text-lg text-destructive">{addinModel.name}</p>
              </div>
            </DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground text-sm">
              This will remove access to this addin for all users.
            </DialogDescription>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDisableForAllUsers}
            >
              Disable for all users
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={__setIsOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center font-sans">
            <Hammer className="w-6 h-6 shrink-0 text-blue-500" />
            <div className="flex flex-row gap-[6px]">
              <p className="text-lg ">Manage</p>
              <p className="text-lg text-blue-500">{addinModel.name}</p>
            </div>
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground text-sm">
            Control who has access to this addin.
          </DialogDescription>
          <Separator />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowIsEnablingForAllUsers(true)}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
            Enable for all users
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowIsDisablingForAllUsers(true)}
          >
            <XCircle className="w-4 h-4 shrink-0 text-red-500" />
            Disable for all users
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
