import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateNewCodeSnippetStore } from "./useCreateNewCodeSnippetStore";

export default function CreateNewCodeSnippetModal() {
  const { isOpen, setIsOpen } = useCreateNewCodeSnippetStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-[6px] items-center">
            New Code Snippet
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
