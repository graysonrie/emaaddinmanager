"use client";
import {
  CheckCircle2,
  Download,
  FileWarning,
  Loader,
  Loader2,
  XCircle,
} from "lucide-react";
import { useAboutAddinModalStore } from "./store";
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

export default function AboutAddinModal() {
  const {
    isOpen,
    setIsOpen,
    error,
    permissionModel,
    addinModel,
    hasFullyLoaded,
  } = useAboutAddinModalStore();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { amIAnAdmin } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    amIAnAdmin().then((x) => setIsAdmin(x == "admin" || x == "super"));
  }, [amIAnAdmin]);

  const addinInstallClicked = () => {
    setIsOpen(false);
    router.replace("dashboard/notifications?autoCheck=true");
  };

  const getIsCurrentlyInstalled = () => {
    if (addinModel?.isInstalledLocally) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <p className="font-sans text-primary text-sm">Currently installed</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="font-sans text-destructive text-sm">
              Not currently installed
            </p>
          </div>

          {!isAdmin && (
            <Button
              onClick={addinInstallClicked}
              variant="outline"
              className="rainbow-border cursor-pointer"
            >
              <Download className="h-4 w-4 shrink-0" />
              Install
            </Button>
          )}
        </div>
      );
    }
  };

  const getAddinTitle = () => {
    if (hasFullyLoaded) {
      return (
        <>
          <p>{permissionModel?.emoji}</p>
          <p className="font-sans pt-1">About</p>{" "}
          <p className="font-sans text-primary pt-1">
            {permissionModel?.displayName}
          </p>
        </>
      );
    } else {
      return (
        <div className="flex gap-2 items-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="font-sans">Loading info...</p>
        </div>
      );
    }
  };

  const getMaintainer = () => {
    if (addinModel?.email) {
      return addinModel.email;
    } else {
      return "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-[6px] items-center">
            {getAddinTitle()}
          </DialogTitle>
        </DialogHeader>

        {hasFullyLoaded && (
          <>
            {error ? (
              <div className="flex gap-2 items-center">
                <FileWarning className="w-4 h-4 text-destructive shrink-0" />
                <p className="font-sans text-destructive text-sm">{error}</p>
              </div>
            ) : (
              <div className="flex gap-2 flex-col">
                <p className="font-sans text-muted-foreground text-sm">
                  {addinModel?.vendorDescription}
                </p>
                <Separator />
                <p className="font-sans text-muted-foreground text-sm">
                  Maintainer: {getMaintainer()}
                </p>
                {getIsCurrentlyInstalled()}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
