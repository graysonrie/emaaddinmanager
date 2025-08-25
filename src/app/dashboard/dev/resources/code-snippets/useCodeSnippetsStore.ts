import getTauriCommands from "@/lib/commands/getTauriCommands";
import { CodeSnippetModel } from "@/lib/models/code-snippet.model";
import { create } from "zustand";

interface Store {
  groups: string[];
  snippets: CodeSnippetModel[];
  error: string | undefined;

  selectedSnippet: CodeSnippetModel | undefined;
  selectSnippet: (snippet: CodeSnippetModel | undefined) => void;

  refresh: () => Promise<void>;
}

export const useCodeSnippetsStore = create<Store>((set, get) => {
  const commands = getTauriCommands();

  const refresh = async () => {
    try {
      console.log("getting code snippets");
      let result = await commands.getAllDevCodeSnippets();
      console.log("code snippets result", result);
      set({
        groups: result.groups,
        snippets: result.codeSnippets,
      });
    } catch (err) {
      const error = err as string;
      console.error("error getting code snippets", error);
      set({ error: "Internal error getting code snippets" });
    }
  };

  return {
    groups: [],
    snippets: [],
    error: undefined,
    selectedSnippet: undefined,
    selectSnippet: (snippet) => {
      set({ selectedSnippet: snippet });
    },
    refresh,
  };
});
