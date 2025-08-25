import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Plus } from "lucide-react";
import { useCreateNewCodeSnippetStore } from "./create-new-modal/useCreateNewCodeSnippetStore";

export default function CodeSnippetsToolbar() {
  const { setIsOpen } = useCreateNewCodeSnippetStore();

  return (
    <div className="w-full border-b p-2">
      <Button variant={"outline"} onClick={() => setIsOpen(true)}>
        <Plus />
        New Snippet
      </Button>
    </div>
  );
}
