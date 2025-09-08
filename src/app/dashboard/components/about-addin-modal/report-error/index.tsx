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
import { useReportAddinErrorModalStore } from "./report-error-modal-store";

export default function ReportErrorModal() {
  const { isOpen, setIsOpen } = useReportAddinErrorModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-[6px] items-center">
            title
          </DialogTitle>
        </DialogHeader>


      </DialogContent>
    </Dialog>
  );
}
