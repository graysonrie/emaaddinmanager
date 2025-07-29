import { TreeNode } from "@/components/file-tree/builder/tree-builder";
import { Button } from "@/components/ui/button";
import { AddinModel } from "@/lib/models/addin.model";
import { Blocks, ChevronLeft, ChevronRight, EyeOff } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

export interface FilePathNode {
  fileTreePath: string;
  displayName?: string;
}

export interface FileTreeRules {
  onlyFolders?: boolean;
  hideFoldersWithName?: string[];
  overrideShowHiddenFolders?: boolean;
  setFirstFolderAsRoot?: boolean;
  rootPath?: string;
  autoSelectPath?: string;
}

type Props<T extends FilePathNode> = {
  nodes: TreeNode<T>[];
  onSelect?: (addin: T) => void;
  onSelectFolder?: (folder: T) => void;
  nodeName: string;
  rules?: FileTreeRules;
  treeRoot?: string; // Add tree root for path conversion
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

function parseRootPath(rootPath?: string): string[] {
  if (!rootPath) return [];

  // Handle Windows drive letter format properly
  // Convert backslashes to forward slashes first
  const normalizedPath = rootPath.replace(/\\/g, "/");

  // Split by forward slashes
  const parts = normalizedPath.split("/").filter((part) => part.trim() !== "");

  // If the first part looks like a drive letter (e.g., "S:"), combine it with the next part
  if (parts.length >= 2 && /^[A-Z]:$/.test(parts[0])) {
    return [parts[0] + parts[1], ...parts.slice(2)];
  }

  return parts;
}

function findRelativePathFromRoot(
  fullPath: string,
  treeRoot: string
): string[] {
  // Normalize both paths to forward slashes
  const normalizedFullPath = fullPath.replace(/\\/g, "/");
  const normalizedTreeRoot = treeRoot.replace(/\\/g, "/");

  console.log("Normalized full path:", normalizedFullPath);
  console.log("Normalized tree root:", normalizedTreeRoot);

  // Try exact match first
  if (normalizedFullPath.startsWith(normalizedTreeRoot)) {
    const relativePath = normalizedFullPath.substring(
      normalizedTreeRoot.length
    );
    const cleanRelativePath = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    const result = cleanRelativePath
      .split("/")
      .filter((part) => part.trim() !== "");
    console.log("Exact match result:", result);
    return result;
  }

  // Try matching without drive letter
  const fullPathWithoutDrive = normalizedFullPath.replace(/^[A-Z]:/, "");
  const treeRootWithoutDrive = normalizedTreeRoot.replace(/^[A-Z]:/, "");

  if (fullPathWithoutDrive.startsWith(treeRootWithoutDrive)) {
    const relativePath = fullPathWithoutDrive.substring(
      treeRootWithoutDrive.length
    );
    const cleanRelativePath = relativePath.startsWith("/")
      ? relativePath.substring(1)
      : relativePath;
    const result = cleanRelativePath
      .split("/")
      .filter((part) => part.trim() !== "");
    console.log("Without drive match result:", result);
    return result;
  }

  // If no match found, return the full path parts
  console.log("No match found, returning full path parts");
  return normalizedFullPath.split("/").filter((part) => part.trim() !== "");
}

function findPathInTree<T extends FilePathNode>(
  nodes: TreeNode<T>[],
  targetPath: string
): string[] {
  // Normalize the target path
  const normalizedTarget = targetPath.replace(/\\/g, "/");
  console.log("Searching for path:", normalizedTarget);

  // Search through the tree to find a node that matches the target path
  function searchNode(
    node: TreeNode<T>,
    currentPath: string[]
  ): string[] | null {
    const nodePath = currentPath.join("/");
    const nodeFileTreePath = node.data.fileTreePath.replace(/\\/g, "/");

    // console.log(
    //   "Checking node:",
    //   node.name,
    //   "path:",
    //   nodePath,
    //   "fileTreePath:",
    //   nodeFileTreePath
    // );

    // Check if this node's path matches our target
    if (
      nodePath === normalizedTarget ||
      nodeFileTreePath === normalizedTarget
    ) {
      console.log("Found matching node:", node.name);
      return currentPath;
    }

    // Search children
    if (node.children) {
      for (const child of node.children) {
        const result = searchNode(child, [...currentPath, child.name]);
        if (result) return result;
      }
    }

    return null;
  }

  // Search through all root nodes
  for (const node of nodes) {
    const result = searchNode(node, [node.name]);
    if (result) return result;
  }

  console.log("No matching path found in tree");

  // If no exact match found, try to find a partial match
  // This handles cases where the tree structure doesn't match the expected path format
  console.log("No exact match found, trying partial match...");

  // Try to find the target folder by name in the tree
  function findFolderByName(
    node: TreeNode<T>,
    currentPath: string[],
    targetFolderName: string
  ): string[] | null {
    // Check if this node's name matches the target folder
    if (node.name === targetFolderName) {
      console.log("Found folder by name:", node.name);
      return currentPath;
    }

    // Search children
    if (node.children) {
      for (const child of node.children) {
        const result = findFolderByName(
          child,
          [...currentPath, child.name],
          targetFolderName
        );
        if (result) return result;
      }
    }

    return null;
  }

  // Extract the target folder name from the path
  const pathParts = normalizedTarget.split("/");
  const targetFolderName = pathParts[pathParts.length - 1]; // Get the last part (folder name)
  console.log("Looking for folder named:", targetFolderName);

  // Search through all root nodes for the folder by name
  for (const node of nodes) {
    const result = findFolderByName(node, [node.name], targetFolderName);
    if (result) return result;
  }

  console.log("No matching path found in tree");
  return [];
}

export default function FileTreeView<T extends FilePathNode>({
  nodes,
  onSelect,
  onSelectFolder,
  rules,
  nodeName,
  treeRoot,
}: Props<T>) {
  const [path, setPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const autoSelectRef = useRef<HTMLLIElement>(null);
  const autoSelectedRef = useRef(false);

  // Parse root path (memoized to prevent recreation on every render)
  const rootPathParts = useMemo(() => {
    if (!rules?.rootPath) return [];

    console.log("Rules root path:", rules.rootPath);

    // First try: search through the tree to find the path (most reliable)
    if (nodes.length > 0) {
      const foundPath = findPathInTree(nodes, rules.rootPath);
      if (foundPath.length > 0) {
        console.log("Found path in tree:", foundPath);
        return foundPath;
      }
    }

    // Second try: If we have a tree root, convert the full path to relative path
    if (treeRoot && treeRoot.length > 0) {
      const relativePath = findRelativePathFromRoot(rules.rootPath, treeRoot);
      if (relativePath.length > 0) {
        console.log("Found relative path:", relativePath);
        return relativePath;
      }
    }

    // Last resort: just parse the path normally
    const parsedPath = parseRootPath(rules.rootPath);
    console.log("Using parsed path:", parsedPath);
    return parsedPath;
  }, [rules?.rootPath, treeRoot, nodes]);

  // Parse auto-select path (memoized to prevent recreation on every render)
  const autoSelectPathParts = useMemo(() => {
    if (!rules?.autoSelectPath) return [];

    // First try: search through the tree to find the path (most reliable)
    if (nodes.length > 0) {
      const foundPath = findPathInTree(nodes, rules.autoSelectPath);
      if (foundPath.length > 0) {
        console.log("Found auto-select path in tree:", foundPath);
        return foundPath;
      }
    }

    // Second try: If we have a tree root, convert the full path to relative path
    if (treeRoot && treeRoot.length > 0) {
      const relativePath = findRelativePathFromRoot(
        rules.autoSelectPath,
        treeRoot
      );
      if (relativePath.length > 0) {
        console.log("Found auto-select relative path:", relativePath);
        return relativePath;
      }
    }

    // Last resort: just parse the path normally
    const parsedPath = parseRootPath(rules.autoSelectPath);
    console.log("Using auto-select parsed path:", parsedPath);
    return parsedPath;
  }, [rules?.autoSelectPath, treeRoot, nodes]);

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

  // Initialize path based on root path or first folder setting
  useEffect(() => {
    if (nodes.length === 0) return; // Wait for nodes to be loaded

    if (rootPathParts.length > 0) {
      // Verify that the root path exists in the tree before setting it
      const rootPathExists = findNodeByPath(nodes, rootPathParts).length > 0;
      if (rootPathExists) {
        console.log("Setting path to:", rootPathParts);
        setPath(rootPathParts);
      } else {
        console.warn(`Root path "${rules?.rootPath}" not found in tree`);
        console.warn("Root path parts:", rootPathParts);
        console.warn(
          "Available nodes:",
          nodes.map((n) => n.name)
        );
        // Fall back to empty path if root path doesn't exist
        setPath([]);
      }
    } else if (rules?.setFirstFolderAsRoot && nodes.length > 0) {
      // Otherwise, if setFirstFolderAsRoot is enabled, navigate to first folder
      const firstNode = nodes[0];
      if (isFolder(firstNode)) {
        setPath([firstNode.name]);
      }
    }
  }, [
    rootPathParts,
    rules?.setFirstFolderAsRoot,
    nodes,
    isFolder,
    rules?.rootPath,
  ]);

  // Handle auto-selection after path is set
  useEffect(() => {
    if (autoSelectedRef.current) return; // Prevent multiple auto-selections
    if (autoSelectPathParts.length === 0) return; // No auto-select path
    if (nodes.length === 0) return; // Wait for nodes to load

    // Only auto-select if we're at the root path or if no root path is specified
    const shouldAutoSelect =
      rootPathParts.length === 0 ||
      (rootPathParts.length > 0 && path.length >= rootPathParts.length);

    if (shouldAutoSelect) {
      // Navigate to the parent directory of the auto-select path
      const parentPath = autoSelectPathParts.slice(0, -1);
      const targetNodeName =
        autoSelectPathParts[autoSelectPathParts.length - 1];

      if (
        parentPath.length > 0 &&
        JSON.stringify(parentPath) !== JSON.stringify(path)
      ) {
        // Only navigate if we're not already at the parent path
        setPath(parentPath);
      } else {
        // We're already at the correct path, just select the node
        setSelectedNode(targetNodeName);

        // Scroll to the selected node after a short delay to ensure rendering
        setTimeout(() => {
          if (autoSelectRef.current) {
            autoSelectRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);

        autoSelectedRef.current = true; // Mark as auto-selected
      }
    }
  }, [autoSelectPathParts, path, nodes, rootPathParts]);

  const currentNodes = findNodeByPath(nodes, path);

  // Debug logging
  // if (rootPathParts.length > 0) {
  //   console.log("Original root path:", rules?.rootPath);
  //   console.log("Tree root:", treeRoot);
  //   console.log("Tree root type:", typeof treeRoot);
  //   console.log("Tree root length:", treeRoot?.length);
  //   console.log("Root path parts (relative):", rootPathParts);
  //   console.log("Current path:", path);
  //   console.log("Current nodes found:", currentNodes.length);
  //   console.log(
  //     "Available root nodes:",
  //     nodes.map((n) => n.name)
  //   );
  // }

  // Filter nodes based on hideFoldersWithName rule
  const filteredNodes = currentNodes.filter((node) => {
    if (!rules?.hideFoldersWithName || rules.overrideShowHiddenFolders) {
      return true; // Show all nodes if no hiding rules or override is enabled
    }

    // Hide folders that match the hideFoldersWithName array
    return !rules.hideFoldersWithName.includes(node.name);
  });

  // Breadcrumbs
  const breadcrumbs =
    rootPathParts.length > 0
      ? [
          { name: "Root", path: rootPathParts },
          ...path.slice(rootPathParts.length).map((name, idx) => ({
            name,
            path: path.slice(0, rootPathParts.length + idx + 1),
          })),
        ]
      : [
          { name: "Root", path: [] },
          ...path.map((name, idx) => ({
            name,
            path: path.slice(0, idx + 1),
          })),
        ];

  const isHiddenFolder = (node: TreeNode<T>) => {
    return rules?.hideFoldersWithName?.includes(node.name) ?? false;
  };

  const isAtRootPath = () => {
    return rootPathParts.length > 0 && path.length === rootPathParts.length;
  };

  const breadcrumbsToDisplay = [breadcrumbs[breadcrumbs.length - 1]];

  const showBackButton =
    breadcrumbs.length > 1 &&
    (!rules?.setFirstFolderAsRoot || path.length > 1) &&
    (rootPathParts.length === 0 || path.length > rootPathParts.length);

  const onNavigateBackClicked = () => {
    const newPath = breadcrumbs[breadcrumbs.length - 2].path;
    // Prevent navigating outside root path
    if (rootPathParts.length === 0 || newPath.length >= rootPathParts.length) {
      setPath(newPath);
      setSelectedNode(null);
    }
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
                // Prevent navigating outside root path
                if (
                  rootPathParts.length === 0 ||
                  crumb.path.length >= rootPathParts.length
                ) {
                  setPath(crumb.path);
                  setSelectedNode(null); // Clear selection when navigating
                }
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
            <li
              key={node.name}
              ref={selectedNode === node.name ? autoSelectRef : null}
            >
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
