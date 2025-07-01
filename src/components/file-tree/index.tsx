import { TreeNode } from "@/components/file-tree/builder/tree-builder";
import { AddinModel } from "@/lib/models/addin.model";
import { useState } from "react";

type Props<T extends { fileTreePath: string }> = {
  nodes: TreeNode<T>[];
  onSelect?: (addin: T) => void;
  onSelectFolder?: (folder: T) => void;
  nodeName: string;
  onlyFolders?: boolean;
};

function findNodeByPath<T extends { fileTreePath: string }>(
  nodes: TreeNode<T>[],
  path: string[]
): TreeNode<T>[] {
  let current = nodes;
  for (const part of path) {
    const next = current.find((n) => n.name === part);
    if (!next || !next.children) return [];
    current = next.children;
  }
  return current;
}

export default function FileTreeView<T extends { fileTreePath: string }>({
  nodes,
  onSelect,
  nodeName,
}: Props<T>) {
  const [path, setPath] = useState<string[]>([]);

  const currentNodes = findNodeByPath(nodes, path);

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Root", path: [] },
    ...path.map((name, idx) => ({
      name,
      path: path.slice(0, idx + 1),
    })),
  ];

  return (
    <div className="w-full overflow-y-auto">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.name} className="flex items-center">
            {idx > 0 && <span className="mx-2">/</span>}
            <button
              className={`hover:underline ${
                idx === breadcrumbs.length - 1
                  ? "font-semibold text-primary"
                  : ""
              }`}
              onClick={() => setPath(crumb.path)}
              disabled={idx === breadcrumbs.length - 1}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      {/* Folder/Addin List */}
      <ul className="space-y-2">
        {currentNodes.map((node) => {
          // Check if it's a folder: either has children OR has no file extension
          const isFolder =
            (node.children && node.children.length > 0) ||
            !node.name.includes(".");

          return isFolder ? (
            <li key={node.name}>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-card border hover:bg-accent transition"
                onClick={() => setPath([...path, node.name])}
              >
                <span className="font-medium">{node.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  (Folder)
                </span>
              </button>
            </li>
          ) : (
            <li key={node.name}>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-card border hover:bg-primary/10 transition"
                onClick={() => node.data && onSelect?.(node.data)}
              >
                <span className="font-medium">{node.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({nodeName})
                </span>
              </button>
            </li>
          );
        })}
        {currentNodes.length === 0 && (
          <li className="text-muted-foreground px-4 py-3">
            No items in this folder.
          </li>
        )}
      </ul>
    </div>
  );
}
