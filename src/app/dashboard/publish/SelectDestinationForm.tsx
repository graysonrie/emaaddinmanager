"use client";

import { useMemo } from "react";
import { usePublishStore } from "./store";
import { buildTree } from "@/components/file-tree/builder/tree-builder";
import { CategoryModel } from "@/lib/models/category.model";
import FileTreeView from "@/components/file-tree";

interface CategoryWithTreePath extends CategoryModel {
  fileTreePath: string;
}

export default function SelectDestinationForm() {
  const { categories, setDestinationCategory } = usePublishStore();

  const root = useMemo(() => {
    return categories.find((c) => c.name === c.fullPath)?.fullPath;
  }, [categories]);

  const tree = useMemo(() => {
    const categoriesWithTreePath: CategoryWithTreePath[] = categories.map(
      (category) => ({
        ...category,
        fileTreePath: category.fullPath,
      })
    );
    return buildTree(categoriesWithTreePath, root ?? "");
  }, [categories, root]);

  return (
    <div className="flex flex-1 min-h-0 px-8 gap-8 h-full w-full overflow-y-auto">
      <FileTreeView
        nodes={tree}
        onSelectFolder={(category) => {
          setDestinationCategory(category);
        }}
        nodeName="Category"
        onlyFolders={true}
      />
    </div>
  );
}
