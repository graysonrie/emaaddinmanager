import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import { useState, useMemo, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CodeSnippetModel } from "@/lib/models/code-snippet.model";

interface TreeNode {
  id: string;
  name: string;
  type: "group" | "file";
  children: TreeNode[];
  snippet?: CodeSnippetModel | null;
  isExpanded?: boolean;
}

interface CodeSnippetFileViewProps {
  width?: "default" | "full";
  showHeader?: boolean;
  selectFolder?: boolean;
  editable?: boolean;
  onFolderSelected?: (folderPath: string) => void;
  onCreateGroup?: (groupPath: string) => Promise<void>;
  expandedNodes?: string[];
  onExpandedNodesChange?: (nodes: string[]) => void;
  onSnippetClicked?: (snippet: CodeSnippetModel) => void;
}

// Helper function to determine if a path is a file or folder
const isFile = (path: string) => {
  return path.includes(".") && !path.endsWith("/");
};

// Helper to get folder name without trailing slash
const getFolderName = (path: string) => {
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

export default function CodeSnippetFileView({
  width = "default",
  showHeader = true,
  selectFolder = false,
  editable = false,
  onFolderSelected,
  onCreateGroup,
  expandedNodes: externalExpandedNodes,
  onExpandedNodesChange,
  onSnippetClicked,
}: CodeSnippetFileViewProps) {
  const { groups, snippets, selectSnippet } = useCodeSnippetsStore();
  const [internalExpandedNodes, setInternalExpandedNodes] = useState<
    Set<string>
  >(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [ghostGroup, setGhostGroup] = useState<{
    parentPath: string;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use external state if provided, otherwise use internal state
  const expandedNodesSet = externalExpandedNodes
    ? new Set(externalExpandedNodes)
    : internalExpandedNodes;

  // Helper to update expanded nodes state
  const setExpandedNodes = (nodes: Set<string>) => {
    if (onExpandedNodesChange) {
      onExpandedNodesChange(Array.from(nodes));
    } else {
      setInternalExpandedNodes(nodes);
    }
  };

  // Build tree structure from flat groups and snippets
  const treeData = useMemo(() => {
    // Helper function to get all parent paths of a path
    const getParentPaths = (path: string): string[] => {
      const parts = path.split("/").filter(Boolean);
      const parents: string[] = [];
      let current = "";
      parts.forEach((part) => {
        current = current ? `${current}/${part}` : part;
        parents.push(current);
      });
      return parents;
    };

    const tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Helper function to get the display name without UUID
    const getDisplayName = (fileName: string) => {
      // If the file has a UUID pattern (name_uuid), show only the name part
      const match = fileName.match(
        /^(.+?)_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      return match ? match[1] : fileName;
    };

    // Helper to get a unique key for a file
    const getFileKey = (path: string, name: string) => {
      const displayName = getDisplayName(name);
      const dirPath = path.split("/").slice(0, -1).join("/");
      return `${dirPath}/${displayName}`;
    };

    // Track added items to prevent duplicates
    const addedPaths = new Map<string, boolean>();
    const addedFiles = new Map<string, boolean>();

    // Helper to ensure a folder exists in the tree
    const ensureFolder = (folderPath: string) => {
      if (!folderPath || addedPaths.has(folderPath.toLowerCase())) return;

      // Add all parent folders first
      const parentPaths = getParentPaths(folderPath);
      parentPaths.forEach((path) => {
        if (!addedPaths.has(path.toLowerCase())) {
          const pathParts = path.split("/").filter(Boolean);
          const folderName = pathParts[pathParts.length - 1];
          const parentPath = pathParts.slice(0, -1).join("/");

          const node: TreeNode = {
            id: path,
            name: folderName,
            type: "group",
            children: [],
          };
          nodeMap.set(path, node);

          if (parentPath) {
            const parent = nodeMap.get(parentPath);
            if (parent) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
          addedPaths.set(path.toLowerCase(), true);
        }
      });
    };

    // Helper to add a file to the tree
    const addFile = (
      filePath: string,
      fileName: string,
      snippet: CodeSnippetModel | undefined
    ) => {
      console.log("filePath", filePath);
      console.log("fileName", fileName);
      console.log("snippet", snippet);

      if (!selectFolder) {
        const displayName = getDisplayName(fileName);
        const fileKey = getFileKey(filePath, fileName);

        if (!addedFiles.has(fileKey)) {
          // For snippets, use their nestedPaths as parent path
          // use slice(1) to remove the first /
          const rawParentPath = filePath
            .split("/")
            .slice(0, -1)
            .join("/")
            .slice(1);
          const parentPath = rawParentPath ? getFolderName(rawParentPath) : "";

          // Ensure the parent folder exists
          // This erroneously creates a folder for each snippet
          // if (parentPath) {
          //   ensureFolder(parentPath);
          // }

          const fileNode: TreeNode = {
            id: filePath,
            name: displayName,
            type: "file",
            children: [],
            snippet,
          };
          console.log("parentPath", parentPath);
          console.log("nodeMap", nodeMap);

          // Try to find the parent folder (normalized key)
          const parent = parentPath ? nodeMap.get(parentPath) : null;

          if (parent) {
            parent.children.push(fileNode);
          } else {
            tree.push(fileNode);
          }
          addedFiles.set(fileKey, true);
        }
      }
    };

    // Process all groups first to establish folder structure
    groups
      .filter((path) => !isFile(path))
      .forEach((path) => {
        if (path) {
          const cleanPath = getFolderName(path);
          ensureFolder(cleanPath);
        }
      });

    // Process all snippets
    console.log("Number of snippets", snippets.length);
    snippets.forEach((snippet) => {
      if (snippet.nestedPaths) {
        // Clean the nested path and ensure the folder exists
        const cleanPath = getFolderName(snippet.nestedPaths);
        ensureFolder(cleanPath);

        // Add the file using the original nestedPaths to maintain correct structure
        addFile(
          `${snippet.nestedPaths}/${snippet.name}`,
          snippet.name,
          snippet
        );
      }
    });

    // Process any remaining files from groups
    // groups.filter(isFile).forEach((path) => {
    //   const normalizedPath = getFolderName(path);
    //   const pathParts = normalizedPath.split("/");
    //   const fileName = pathParts.pop() || normalizedPath;
    //   const filePath = `${pathParts.join("/")}/${fileName}`.replace(/^\//, "");
    //   addFile(filePath, fileName, undefined);
    // });

    return tree;
  }, [groups, snippets, selectFolder, refreshKey]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodesSet);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleFolderClick = (node: TreeNode) => {
    if (selectFolder) {
      setSelectedFolder(node.id);
      onFolderSelected?.(node.id);
    } else if (node.type === "group") {
      // Always allow toggling for groups
      toggleNode(node.id);
    }
  };

  const handleFolderDoubleClick = (node: TreeNode) => {
    if (selectFolder) {
      toggleNode(node.id);
    }
  };

  const handleAddGroup = (parentPath: string | null) => {
    setGhostGroup({ parentPath: parentPath || "", name: "" });
    if (parentPath) {
      const newExpanded = new Set(expandedNodesSet);
      newExpanded.add(parentPath);
      setExpandedNodes(newExpanded);
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleGhostGroupSubmit = async (name: string) => {
    if (name.trim()) {
      const fullPath = ghostGroup?.parentPath
        ? `${ghostGroup.parentPath}/${name.trim()}`
        : name.trim();

      try {
        await onCreateGroup?.(fullPath);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    }
    setGhostGroup(null);
  };

  const handleGhostGroupCancel = () => {
    setGhostGroup(null);
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodesSet.has(node.id);
    const hasChildren = node.children.length > 0;
    const isGroup = node.type === "group";
    const isSelected = selectFolder && selectedFolder === node.id;
    const showAddButton = editable && isGroup && isExpanded;

    // For groups, check if they should be expandable by looking at the actual data
    const shouldBeExpandable =
      isGroup &&
      (hasChildren || // Has direct children in the tree
        node.children.length > 0 || // Double-check children
        groups.some(
          (path) => !isFile(path) && path.startsWith(node.id + "/")
        ) ||
        snippets.some((snippet) => {
          // Check if this folder contains any snippets
          return (
            snippet.nestedPaths === node.id ||
            (snippet.nestedPaths &&
              getFolderName(snippet.nestedPaths).startsWith(
                getFolderName(node.id)
              ))
          );
        }));

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 hover:bg-primary/10 hover:text-accent-foreground cursor-pointer select-none rounded-sm",
            depth > 0 && "ml-4",
            node.snippet && "text-sm",
            isSelected && "bg-primary/20 border border-primary/40"
          )}
          onClick={() => {
            if (isGroup) {
              handleFolderClick(node);
            } else if (!selectFolder) {
              if (node.snippet) {
                if (onSnippetClicked) {
                  onSnippetClicked(node.snippet);
                } else {
                  selectSnippet(node.snippet);
                }
              } else {
                console.warn("No snippet found for file", node.id);
              }
            }
          }}
          onDoubleClick={() => {
            if (isGroup) {
              handleFolderDoubleClick(node);
            }
          }}
        >
          {isGroup ? (
            <>
              {shouldBeExpandable ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(node.id);
                  }}
                  className="p-0.5 hover:bg-accent rounded-sm transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4 text-primary" />
              <span className="text-sm font-sans">{node.name}</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4" />
              <FileCode className="w-4 h-4 text-primary" />
              <span className="truncate text-sm font-sans">{node.name}</span>
            </>
          )}
        </div>

        {/* Add Group Button */}
        {showAddButton && (
          <div className={cn("ml-4", depth > 0 && "ml-8")}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddGroup(node.id);
              }}
              className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Group</span>
            </button>
          </div>
        )}

        {/* Ghost Group Input */}
        {ghostGroup?.parentPath === node.id && (
          <div className={cn("ml-4", depth > 0 && "ml-8")}>
            <div className="flex items-center gap-2 px-2 py-1">
              <Folder className="w-4 h-4 text-primary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Group name..."
                className="flex-1 px-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={ghostGroup.name}
                onChange={(e) =>
                  setGhostGroup((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGhostGroupSubmit(ghostGroup.name);
                  } else if (e.key === "Escape") {
                    handleGhostGroupCancel();
                  }
                }}
                onBlur={() => handleGhostGroupCancel()}
                autoFocus
              />
            </div>
          </div>
        )}

        {isGroup && isExpanded && (
          <div>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Determine width classes based on prop
  const widthClasses = width === "full" ? "w-full" : "w-40 md:w-80";

  return (
    <div className={cn(widthClasses, "flex flex-col h-full min-h-0")}>
      {showHeader && (
        <div className="p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {selectFolder ? "Select Folder" : "Code Snippets"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectFolder
              ? "Click to select a folder, double-click to expand"
              : `${snippets.length} snippets in ${groups.length} groups`}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {/* Root Level Add Group Button */}
        {editable && (
          <div className="mb-2">
            <button
              onClick={() => handleAddGroup(null)}
              className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Root Group</span>
            </button>
          </div>
        )}

        {/* Root Level Ghost Group Input */}
        {ghostGroup && !ghostGroup.parentPath && (
          <div className="mb-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <Folder className="w-4 h-4 text-primary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Root group name..."
                className="flex-1 px-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={ghostGroup.name}
                onChange={(e) =>
                  setGhostGroup((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGhostGroupSubmit(ghostGroup.name);
                  } else if (e.key === "Escape") {
                    handleGhostGroupCancel();
                  }
                }}
                onBlur={() => handleGhostGroupCancel()}
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          {treeData.map((node) => renderTreeNode(node))}
        </div>

        {treeData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>
              {selectFolder ? "No folders found" : "No code snippets found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
