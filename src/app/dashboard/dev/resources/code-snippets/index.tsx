import { useEffect } from "react";
import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import CodeSnippetFileView from "./CodeSnippetFileView";
import CodeSnippetViewer from "./CodeSnippetViewer";
import CodeSnippetsToolbar from "./CodeSnippetsToolbar";
import CreateNewCodeSnippetModal from "./create-new-modal";

export default function DevCodeSnippets() {
  const { refresh } = useCodeSnippetsStore();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <CodeSnippetsToolbar />
      <div className="flex gap-2 w-full h-full min-h-0">
        <CodeSnippetFileView />
        <CodeSnippetViewer />
      </div>
      <CreateNewCodeSnippetModal />
    </div>
  );
}
