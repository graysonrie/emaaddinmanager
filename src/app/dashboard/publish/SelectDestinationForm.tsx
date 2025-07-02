"use client";

import { useMemo } from "react";
import { usePublishStore } from "./store";
import { buildTree } from "@/components/file-tree/builder/tree-builder";
import { CategoryModel } from "@/lib/models/category.model";
import FileTreeView from "@/components/file-tree";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Destination</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto">
          <FileTreeView
            nodes={tree}
            onSelectFolder={(category) => {
              setDestinationCategory(category);
            }}
            nodeName="Category"
            onlyFolders={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
