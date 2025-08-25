import { useCodeSnippetsStore } from "./useCodeSnippetsStore";
import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  type: "group" | "file";
  children: TreeNode[];
  snippet?: any;
  isExpanded?: boolean;
}

export default function CodeSnippetFileView() {
  const { groups, snippets, selectSnippet } = useCodeSnippetsStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build tree structure from flat groups and snippets
  const treeData = useMemo(() => {
    const tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Process groups first
    groups.forEach((groupPath) => {
      if (!groupPath) return;

      const pathParts = groupPath.split("/").filter(Boolean);
      let currentPath = "";

      pathParts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const node: TreeNode = {
            id: currentPath,
            name: part,
            type: "group",
            children: [],
          };
          nodeMap.set(currentPath, node);

          if (parentPath) {
            const parent = nodeMap.get(parentPath);
            if (parent) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    // Process snippets and add them to appropriate groups
    snippets.forEach((snippet) => {
      const groupPath = snippet.nestedPaths;
      const fileName = snippet.name;

      if (groupPath) {
        // Add to specific group
        const group = nodeMap.get(groupPath);
        if (group) {
          group.children.push({
            id: `${groupPath}/${fileName}`,
            name: fileName,
            type: "file",
            children: [],
            snippet,
          });
        }
      } else {
        // Add to root level
        tree.push({
          id: fileName,
          name: fileName,
          type: "file",
          children: [],
          snippet,
        });
      }
    });

    return tree;
  }, [groups, snippets]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isGroup = node.type === "group";

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 hover:bg-accent hover:text-accent-foreground cursor-pointer select-none",
            depth > 0 && "ml-4",
            node.snippet && "text-sm"
          )}
          onClick={() => {
            if (isGroup) {
              toggleNode(node.id);
            } else if (node.snippet) {
              selectSnippet(node.snippet);
            }
          }}
        >
          {isGroup ? (
            <>
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              <Folder className="w-4 h-4 text-primary" />
              <span className="text-sm font-sans">{node.name}</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4" />
              <FileCode className="w-4 h-4 text-secondary" />
              <span className="truncate text-sm font-sans">{node.name}</span>
            </>
          )}
        </div>

        {isGroup && isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 border-r  flex flex-col h-full min-h-0">
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold">Code Snippets</h3>
        <p className="text-sm text-muted-foreground">
          {snippets.length} snippets in {groups.length} groups
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="space-y-1">
          {treeData.map((node) => renderTreeNode(node))}
        </div>

        {treeData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No code snippets found</p>
          </div>
        )}
      </div>
    </div>
  );
}
