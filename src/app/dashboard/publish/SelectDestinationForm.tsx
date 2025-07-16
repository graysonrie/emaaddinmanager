"use client";

import { useMemo } from "react";
import { buildTree } from "@/components/file-tree/builder/tree-builder";
import { CategoryModel } from "@/lib/models/category.model";
import FileTreeView from "@/components/file-tree";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";

interface CategoryWithTreePath extends CategoryModel {
  fileTreePath: string;
}

interface Props {
  categories: CategoryModel[];
  setDestinationCategory: (category: CategoryModel | null) => void;
  overrideDestinationPath?: string;
}

export default function SelectDestinationForm({
  categories,
  setDestinationCategory,
  overrideDestinationPath,
}: Props) {
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
      {overrideDestinationPath ? (
        <>
          <CardHeader>
            <CardTitle className="text-muted-foreground">
              Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {overrideDestinationPath}
            </p>
          </CardContent>
        </>
      ) : (
        <>
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
                rules={{ onlyFolders: true }}
              />
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
