"use client";

import { useEffect, useMemo, useState } from "react";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { findCommonRoot } from "./addin-tree-builder/utils";
import { buildAddinTree } from "./addin-tree-builder/tree-builder";
import AddinTreeView from "./AddinTreeView";
import { AddinModel } from "@/lib/models/addin.model";
import { useLibraryStore } from "./store";
import AddinPreview from "./AddinPreview";

export default function LibraryPage() {
  const { addins } = useAddinRegistry();
  const root = useMemo(
    () => findCommonRoot(addins.map((a) => a.pathToAddinDllFolder)),
    [addins]
  );
  const tree = useMemo(() => buildAddinTree(addins, root), [addins, root]);

  const { selectedAddin, setSelectedAddin } = useLibraryStore();

  // useEffect(() => {
  //   console.log(addins);
  // }, [addins]);

  return (
    <div className="flex flex-1 min-h-0 px-8gap-8 h-full">
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
