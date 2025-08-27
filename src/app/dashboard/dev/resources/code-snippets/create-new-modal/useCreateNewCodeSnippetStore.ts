import { create } from "zustand";
import getTauriCommands from "@/lib/commands/getTauriCommands";

type Phase = "code" | "destination";

interface Store {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  code: string;
  language: string;
  name: string;
  description: string;
  setDescription: (val: string) => void;
  setCode: (val: string) => void;
  setLanguage: (val: string) => void;
  setName: (val: string) => void;
  phase: Phase;
  setPhase: (val: Phase) => void;
  selectedFolder: string | null;
  setSelectedFolder: (val: string | null) => void;
  createGroup: (groupPath: string) => Promise<void>;
  createSnippet:()=>Promise<void>;
}

export const useCreateNewCodeSnippetStore = create<Store>((set, get) => {
  return {
    isOpen: false,
    setIsOpen: (value) => {
      set({
        isOpen: value,
        selectedFolder: null,
      });
    },
    code: "",
    language: "c#",
    name: "",
    description: "",
    setDescription: (val) => {
      set({
        description: val,
      });
    },
    setCode: (val) => {
      set({
        code: val,
      });
    },
    setLanguage: (val) => {
      set({
        language: val,
      });
    },
    setName: (val) => {
      set({
        name: val,
      });
    },
    phase: "code",
    setPhase: (val) => {
      set({
        phase: val,
      });
    },
    selectedFolder: null,
    setSelectedFolder: (val) => {
      set({
        selectedFolder: val,
      });
    },
    createGroup: async (groupPath) => {
      const { createDevCodeSnippetGroup } = getTauriCommands();
      await createDevCodeSnippetGroup(groupPath);
    },
    createSnippet: async () => {
      const { addDevCodeSnippet } = getTauriCommands();
      const selectedFolder = get().selectedFolder;
      if (!selectedFolder) {
        throw new Error("No folder selected");
      }
      await addDevCodeSnippet({
        code: get().code,
        language: get().language,
        name: get().name,
        description: get().description,
        nestedPaths: selectedFolder,
      });
    },
  };
});
