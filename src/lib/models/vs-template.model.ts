export interface VsTemplateModel {
  version: string;
  displayName: string;
  description: string;
  imageData: number[]; // Backend sends Vec<u8> which becomes number[] in TypeScript
  isInstalled: boolean;
}
