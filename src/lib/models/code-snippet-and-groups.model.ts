import { CodeSnippetModel } from "./code-snippet.model";

export interface CodeSnippetAndGroupsModel {
  codeSnippets: CodeSnippetModel[];
  /** Can be something like Group1/Group2 if it in groups. Otherwise can just be empty if it is the default */
  groups: string[];
}
