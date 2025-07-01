export type TreeNode<T extends { fileTreePath: string }> = {
  name: string;
  children?: TreeNode<T>[];
  data?: T;
};

export function buildTree<T extends { fileTreePath: string }>(
  dataPoints: T[],
  root: string
): TreeNode<T>[] {
  const tree: TreeNode<T>[] = [];
  for (const dataPoint of dataPoints) {
    const relPath = dataPoint.fileTreePath.replace(root + "\\", "");
    const parts = relPath.split("\\");
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let node = current.find((n) => n.name === part);
      if (!node) {
        node = { name: part, children: [] };
        current.push(node);
      }
      if (i === parts.length - 1) {
        node.data = dataPoint;
      }
      current = node.children!;
    }
  }
  return tree;
}
