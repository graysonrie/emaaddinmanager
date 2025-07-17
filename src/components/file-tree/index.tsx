import { TreeNode } from "@/components/file-tree/builder/tree-builder";
import { Button } from "@/components/ui/button";
import { AddinModel } from "@/lib/models/addin.model";
import { Blocks, ChevronLeft, ChevronRight, EyeOff } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export interface FilePathNode {
  fileTreePath: string;
  displayName?: string;
}

export interface FileTreeRules {
  onlyFolders?: boolean;
  hideFoldersWithName?: string[];
  overrideShowHiddenFolders?: boolean;
  setFirstFolderAsRoot?: boolean;
}

type Props<T extends FilePathNode> = {
  nodes: TreeNode<T>[];
  onSelect?: (addin: T) => void;
  onSelectFolder?: (folder: T) => void;
  nodeName: string;
  rules?: FileTreeRules;
};

function findNodeByPath<T extends FilePathNode>(
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

export default function FileTreeView<T extends FilePathNode>({
  nodes,
  onSelect,
  onSelectFolder,
  rules,
  nodeName,
}: Props<T>) {
  const [path, setPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Auto-navigate to first folder if setFirstFolderAsRoot is enabled
  useEffect(() => {
    if (rules?.setFirstFolderAsRoot && nodes.length > 0) {
      const firstNode = nodes[0];
      if (isFolder(firstNode)) {
        setPath([firstNode.name]);
      }
    }
  }, [nodes, rules?.setFirstFolderAsRoot]);

  const currentNodes = findNodeByPath(nodes, path);

  const isFolder = useCallback(
    (node: TreeNode<T>) => {
      if (rules?.onlyFolders) {
        return (
          (node.children && node.children.length > 0) ||
          !node.name.includes(".")
        );
      }
      return node.children && node.children.length > 0;
    },
    [rules?.onlyFolders]
  );

  // Auto-navigate to first folder if setFirstFolderAsRoot is enabled
  useEffect(() => {
    if (rules?.setFirstFolderAsRoot && nodes.length > 0) {
      const firstNode = nodes[0];
      if (isFolder(firstNode)) {
        setPath([firstNode.name]);
      }
    }
  }, [nodes, rules?.setFirstFolderAsRoot, isFolder]);

  // Filter nodes based on hideFoldersWithName rule
  const filteredNodes = currentNodes.filter((node) => {
    if (!rules?.hideFoldersWithName || rules.overrideShowHiddenFolders) {
      return true; // Show all nodes if no hiding rules or override is enabled
    }

    // Hide folders that match the hideFoldersWithName array
    return !rules.hideFoldersWithName.includes(node.name);
  });

  // Breadcrumbs
  const breadcrumbs = [
    { name: "Root", path: [] },
    ...path.map((name, idx) => ({
      name,
      path: path.slice(0, idx + 1),
    })),
  ];

  const isHiddenFolder = (node: TreeNode<T>) => {
    return rules?.hideFoldersWithName?.includes(node.name) ?? false;
  };

  const breadcrumbsToDisplay = [breadcrumbs[breadcrumbs.length - 1]];

  const showBackButton =
    breadcrumbs.length > 1 && (!rules?.setFirstFolderAsRoot || path.length > 1);

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
        {filteredNodes.map((node) => {
          const nodeName = node.data.displayName
            ? node.data.displayName
            : node.name;
          return isFolder(node) ? (
            <li key={node.name}>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg border transition cursor-pointer ${
                  selectedNode === node.name
                    ? "border-primary bg-primary/10"
                    : "bg-card hover:bg-accent"
                }`}
                onClick={() => {
                  if (rules?.onlyFolders && onSelectFolder && node.data) {
                    // Single click: select the folder
                    setSelectedNode(node.name);
                    onSelectFolder(node.data);
                  } else {
                    // Single click: navigate into folder
                    setPath([...path, node.name]);
                  }
                }}
                onDoubleClick={() => {
                  if (rules?.onlyFolders) {
                    // Double click: navigate into folder
                    setPath([...path, node.name]);
                    setSelectedNode(null); // Clear selection when navigating
                  }
                }}
              >
                <div className="flex items-center">
                  {rules?.overrideShowHiddenFolders && isHiddenFolder(node) && (
                    <EyeOff className="w-4 h-4 mr-2 text-muted-foreground" />
                  )}
                  <span className="font-medium">{node.name}</span>
                  {!rules?.onlyFolders && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Folder)
                    </span>
                  )}
                </div>
              </button>
            </li>
          ) : (
            <li key={nodeName}>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-card border hover:bg-primary/10 transition cursor-pointer flex items-center"
                onClick={() => node.data && onSelect?.(node.data)}
              >
                <Blocks className="w-4 h-4 mr-2" />
                <span className="font-medium">{nodeName}</span>
              </button>
            </li>
          );
        })}
        {filteredNodes.length === 0 && (
          <li className="text-muted-foreground px-4 py-3">
            No items in this folder.
          </li>
        )}
      </ul>
    </div>
  );
}
