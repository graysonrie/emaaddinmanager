"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { findCommonRoot } from "./addin-tree-builder/utils";
import { buildAddinTree } from "./addin-tree-builder/tree-builder";
import AddinTreeView from "./AddinTreeView";
import { AddinModel } from "@/lib/models/addin.model";
import { useLibraryStore } from "./store";
import AddinPreview from "./AddinPreview";

export default function LibraryPage() {
  const { addins, isLoading } = useAddinRegistry();
  const { selectedAddin, setSelectedAddin } = useLibraryStore();
  const [treeData, setTreeData] = useState<{ root: string; tree: any[] }>({
    root: "",
    tree: [],
  });
  const [isBuildingTree, setIsBuildingTree] = useState(false);

  // Deferred tree building to prevent UI blocking
  const buildTreeDeferred = useCallback((addins: AddinModel[]) => {
    if (addins.length === 0) {
      setTreeData({ root: "", tree: [] });
      return;
    }

    setIsBuildingTree(true);

    // Use requestIdleCallback or setTimeout to defer the work
    const deferTreeBuilding = () => {
      console.log("Building tree for", addins.length, "addins");
      const startTime = performance.now();

      const root = findCommonRoot(addins.map((a) => a.pathToAddinDllFolder));
      console.log("Found common root:", root);

      const tree = buildAddinTree(addins, root);
      const endTime = performance.now();

      console.log(
        `Tree built in ${endTime - startTime}ms with ${tree.length} root nodes`
      );

      setTreeData({ root, tree });
      setIsBuildingTree(false);
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(deferTreeBuilding);
    } else {
      setTimeout(deferTreeBuilding, 0);
    }
  }, []);

  // Build tree when addins change
  useEffect(() => {
    if (!isLoading && addins.length > 0) {
      buildTreeDeferred(addins);
    } else if (!isLoading) {
      setTreeData({ root: "", tree: [] });
    }
  }, [addins, isLoading, buildTreeDeferred]);

  const { tree } = treeData;

  if (isLoading || isBuildingTree) {
    return (
      <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
        <div className="flex flex-col h-full w-full bg-background">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold mb-1">Addin Library</h2>
            <p className="text-muted-foreground mb-4">
              {isLoading ? "Loading addins..." : "Building tree structure..."}
            </p>
          </div>
          <div className="flex flex-1 min-h-0 px-8 pb-8 gap-8">
            <div className="w-full max-w-md flex-shrink-0">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
      <div className="flex flex-col h-full w-full bg-background">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold mb-1">Addin Library</h2>
          <p className="text-muted-foreground mb-4">
            Browse and preview available addins. Click a folder to navigate, or
            select an addin to see more details.
          </p>
        </div>
        <div className="flex flex-1 min-h-0 px-8 pb-8 gap-8">
          {/* Left: Tree View */}
          <div className="w-full max-w-md flex-shrink-0">
            <AddinTreeView
              nodes={tree}
              onSelect={(addin) => setSelectedAddin(addin)}
            />
          </div>
        </div>
      </div>
      <AddinPreview />
    </div>
  );
}
