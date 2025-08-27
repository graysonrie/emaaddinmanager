import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CodeBlock from "./code/CodeBlock";
import { Button } from "@/components/ui/button";
import { CodeSnippetModel } from "@/lib/models/code-snippet.model";
import { ClipboardCopyIcon, CheckIcon } from "lucide-react";

export default function CodeSnippetViewer() {
  const { error, selectedSnippet } = useCodeSnippetsStore();
  const [copied, setCopied] = useState(false);
  const revertTimerRef = useRef<number | null>(null);

  const getDescription = (snippet: CodeSnippetModel) => {
    if (snippet.description) {
      return snippet.description;
    }
    return "No description provided";
  };

  if (error) {
    return (
      <div className="flex-1 p-6 overflow-hidden">
        <div className="text-center text-destructive">
          <p className="text-lg font-medium">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedSnippet) {
    return (
      <div className="flex-1 p-6 overflow-hidden">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-lg font-medium">No snippet selected</p>
          <p className="text-sm">
            Select a code snippet from the file tree to view it
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedSnippet.code || "");
      setCopied(true);
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
      revertTimerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };


  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{selectedSnippet.name}</h2>
            <Badge variant="outline">
              {selectedSnippet.language.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              onClick={handleCopy}
              className="cursor-pointer"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 shrink-0" />
              ) : (
                <ClipboardCopyIcon className="w-4 h-4 shrink-0" />
              )}
              {copied ? "Copied" : "Copy code"}
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {getDescription(selectedSnippet)}
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0 w-full">
        <div className="flex flex-col min-h-0 flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Code</h3>
          </div>
          <div className="rounded-lg border bg-muted/40 flex-1 overflow-auto min-h-0 w-full">
            <CodeBlock
              code={selectedSnippet.code}
              language={selectedSnippet.language}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-h-0">
          {selectedSnippet.metadata &&
            Object.keys(selectedSnippet.metadata).length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Metadata</h3>
                <div className="rounded-lg border bg-muted/40">
                  <ScrollArea className="h-40">
                    <pre className="text-sm p-4">
                      {JSON.stringify(selectedSnippet.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
