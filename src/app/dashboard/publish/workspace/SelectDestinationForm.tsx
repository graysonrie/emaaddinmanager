"use client";

import { useMemo } from "react";
import { buildTree } from "@/components/file-tree/builder/tree-builder";
import { CategoryModel } from "@/lib/models/category.model";
import FileTreeView from "@/components/file-tree";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { usePublishDestinationStore } from "../stores/usePublishDestinationStore";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";

interface CategoryWithTreePath extends CategoryModel {
  fileTreePath: string;
}

interface Props {
  categories: CategoryModel[];
}

export default function SelectDestinationForm({ categories }: Props) {
  const registryPath = useConfigValue("localAddinRegistryPath");
  const { destinationCategory, setDestinationCategory } =
    usePublishDestinationStore();
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
              rules={{
                hideFoldersWithName: ["AddinPackages"],
                onlyFolders: true,
                rootPath: registryPath,
                autoSelectPath: destinationCategory?.fullPath,
              }}
            />
          </div>
        </CardContent>
      </>
    </Card>
  );
}
