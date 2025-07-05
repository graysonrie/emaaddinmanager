import { TreeNode } from "@/components/file-tree/builder/tree-builder";
import { Button } from "@/components/ui/button";
import { AddinModel } from "@/lib/models/addin.model";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  onSelectFolder,
  onlyFolders,
  nodeName,
}: Props<T>) {
  const [path, setPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const currentNodes = findNodeByPath(nodes, path);

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Root", path: [] },
    ...path.map((name, idx) => ({
      name,
      path: path.slice(0, idx + 1),
    })),
  ];

  const isFolder = (node: TreeNode<T>) => {
    if (onlyFolders) {
      return (
        (node.children && node.children.length > 0) || !node.name.includes(".")
      );
    }
    return node.children && node.children.length > 0;
  };

  const breadcrumbsToDisplay = [breadcrumbs[breadcrumbs.length - 1]];

  const showBackButton = breadcrumbs.length > 1;

  const onNavigateBackClicked = () => {
    setPath(breadcrumbs[breadcrumbs.length - 2].path);
    setSelectedNode(null);
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center text-sm text-muted-foreground gap-2">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onNavigateBackClicked}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {breadcrumbsToDisplay.map((crumb, idx) => (
          <span key={crumb.name} className="flex items-center">
            {idx > 0 && <span className="mx-2">/</span>}
            <button
              className={`hover:underline font-semibold text-primary`}
              onClick={() => {
                setPath(crumb.path);
                setSelectedNode(null); // Clear selection when navigating
              }}
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
          return isFolder(node) ? (
            <li key={node.name}>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg border transition cursor-pointer ${
                  selectedNode === node.name
                    ? "border-primary bg-primary/10"
                    : "bg-card hover:bg-accent"
                }`}
                onClick={() => {
                  if (onlyFolders && onSelectFolder && node.data) {
                    // Single click: select the folder
                    setSelectedNode(node.name);
                    onSelectFolder(node.data);
                  } else {
                    // Single click: navigate into folder
                    setPath([...path, node.name]);
                  }
                }}
                onDoubleClick={() => {
                  if (onlyFolders) {
                    // Double click: navigate into folder
                    setPath([...path, node.name]);
                    setSelectedNode(null); // Clear selection when navigating
                  }
                }}
              >
                <span className="font-medium">{node.name}</span>
                {!onlyFolders && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Folder)
                  </span>
                )}
              </button>
            </li>
          ) : (
            <li key={node.name}>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-card border hover:bg-primary/10 transition cursor-pointer"
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
