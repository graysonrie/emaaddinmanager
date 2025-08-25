import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CodeSnippetViewer() {
  const { error, selectedSnippet } = useCodeSnippetsStore();

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

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">{selectedSnippet.name}</h2>
          <Badge variant="secondary">{selectedSnippet.language}</Badge>
        </div>
        <p className="text-muted-foreground">{selectedSnippet.description}</p>
      </div>

      <div className="space-y-4 flex-1 overflow-hidden min-h-0">
        {selectedSnippet.metadata &&
          Object.keys(selectedSnippet.metadata).length > 0 && (
            <div className="flex-shrink-0">
              <h3 className="text-lg font-semibold mb-2">Metadata</h3>
              <div className="bg-muted p-4 rounded-lg">
                <ScrollArea className="h-32">
                  <pre className="text-sm">
                    {JSON.stringify(selectedSnippet.metadata, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <h3 className="text-lg font-semibold mb-2 flex-shrink-0">Code</h3>
          <div className="bg-muted rounded-lg flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <pre className="text-sm font-mono p-4">
                <code>{selectedSnippet.code}</code>
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
