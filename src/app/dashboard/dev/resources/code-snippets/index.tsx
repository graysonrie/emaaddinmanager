import { useEffect } from "react";
import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import CodeSnippetFileView from "./file-viewer";
import CodeSnippetViewer from "./CodeSnippetViewer";
import { useFileViewerStore } from "./useFileViewerStore";
import CodeSnippetsToolbar from "./CodeSnippetsToolbar";
import CreateNewCodeSnippetModal from "./create-new-modal";

export default function DevCodeSnippets() {
  const { refresh, selectSnippet } = useCodeSnippetsStore();
  const { expandedNodes, setExpandedNodes } = useFileViewerStore();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <CodeSnippetsToolbar />
      <div className="flex gap-2 h-full min-h-0 w-full">
        <CodeSnippetFileView
          expandedNodes={expandedNodes}
          onExpandedNodesChange={setExpandedNodes}
          onSnippetClicked={(snippet) => {
            selectSnippet(snippet);
            console.log(snippet);
          }}
        />
        <CodeSnippetViewer />
      </div>
      <CreateNewCodeSnippetModal />
    </div>
  );
}
