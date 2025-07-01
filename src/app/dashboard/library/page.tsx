"use client";

import { useEffect, useMemo, useState } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { findCommonRoot } from "@/components/file-tree/builder/utils";
import { AddinModel } from "@/lib/models/addin.model";
import { useLibraryStore } from "./store";
import AddinPreview from "./AddinPreview";
import {
  buildTree,
  TreeNode,
} from "@/components/file-tree/builder/tree-builder";
import FileTreeView from "@/components/file-tree";

// Type-safe interface for addins with file tree path
interface AddinWithTreePath extends AddinModel {
  fileTreePath: string;
}

export default function LibraryPage() {
  const { addins } = useAddinRegistry();
  const root = useMemo(
    () => findCommonRoot(addins.map((a) => a.pathToAddinDllFolder)),
    [addins]
  );
  const tree = useMemo(() => {
    const addinsWithTreePath: AddinWithTreePath[] = addins.map((addin) => ({
      ...addin,
      fileTreePath: addin.pathToAddinDllFolder,
    }));

    return buildTree(addinsWithTreePath, root);
  }, [addins, root]);

  const { selectedAddin, setSelectedAddin } = useLibraryStore();

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
            <FileTreeView
              nodes={tree}
              onSelect={(addin) => setSelectedAddin(addin)}
              nodeName="Addin"
            />
          </div>
        </div>
      </div>
      <AddinPreview />
    </div>
  );
}
