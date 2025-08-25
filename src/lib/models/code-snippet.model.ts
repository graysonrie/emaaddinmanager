export interface CodeSnippetModel {
  metadata?: object;
  name: string;
  code: string;
  description: string;
  language: string;
  /** Can be something like Group1/Group2 if it in groups. Otherwise can just be empty if it is the default */
  nestedPaths: string;
}
