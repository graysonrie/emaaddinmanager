import { AddinModel } from "@/lib/models/addin.model";

export type AddinTreeNode = {
    name: string;
    children?: AddinTreeNode[];
    addin?: AddinModel;
  };

  export function buildAddinTree(addins: AddinModel[], root: string): AddinTreeNode[] {
    const tree: AddinTreeNode[] = [];
    for (const addin of addins) {
      const relPath = addin.pathToAddinDllFolder.replace(root + "\\", "");
      const parts = relPath.split("\\");
      let current = tree;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        let node = current.find(n => n.name === part);
        if (!node) {
          node = { name: part, children: [] };
          current.push(node);
        }
        if (i === parts.length - 1) {
          node.addin = addin;
        }
        current = node.children!;
      }
    }
    return tree;
  }