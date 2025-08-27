import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateNewCodeSnippetStore } from "./useCreateNewCodeSnippetStore";
import { useCodeSnippetsStore } from "../useCodeSnippetsStore";
import { useState } from "react";
import CodeBlock from "../code/CodeBlock";
import { Textarea } from "@/components/ui/textarea";
import LanguageSelect from "./LanguageSelect";
import { PopoverAnchor } from "@radix-ui/react-popover";
import CodeSnippetFileView from "../CodeSnippetFileView";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateNewCodeSnippetModal() {
  const {
    isOpen,
    setIsOpen,
    code,
    language,
    name,
    setCode,
    setLanguage,
    setName,
    phase,
    setPhase,
    selectedFolder,
    setSelectedFolder,
    description,
    setDescription,
  } = useCreateNewCodeSnippetStore();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = () => {
    if (phase === "code") {
      setSelectedFolder(null);
      setPhase("destination");
    }
  };

  const handleBack = () => {
    if (phase === "destination") {
      setPhase("code");
    }
  };

  const handleSubmit = async () => {
    try {
      const { createSnippet } = useCreateNewCodeSnippetStore.getState();
      await createSnippet();
      setIsOpen(false);
    } catch (error) {
      setSubmitError(error as string);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex gap-[6px] items-center">
            New Code Snippet
          </DialogTitle>
        </DialogHeader>

        {phase === "code" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="language">Language</Label>
              <LanguageSelect onValueChange={setLanguage} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter snippet name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs font-sans"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter snippet description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs font-sans max-h-[60vh]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                placeholder="Paste your code here"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-xs font-mono max-h-[60vh]"
              />
            </div>
            <Button
              onClick={handleNext}
              disabled={!code.trim() || !name.trim()}
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Select Destination Folder</Label>
              <div className="border rounded-lg p-4">
                <CodeSnippetFileView
                  width="full"
                  showHeader={false}
                  selectFolder={true}
                  editable={true}
                  onFolderSelected={(folder) => {
                    setSelectedFolder(folder);
                    console.log("selected folder", folder);
                  }}
                  onCreateGroup={async (groupPath) => {
                    try {
                      const { createGroup } =
                        useCreateNewCodeSnippetStore.getState();
                      await createGroup(groupPath);
                      console.log("Created group:", groupPath);

                      // Refresh the main code snippets store to get updated groups
                      const { refresh } = useCodeSnippetsStore.getState();
                      await refresh();
                    } catch (error) {
                      console.error("Failed to create group:", error);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!selectedFolder}>
                Create Snippet
              </Button>
              {submitError && <p className="text-red-500">{submitError}</p>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
