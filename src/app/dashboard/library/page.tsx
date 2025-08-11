"use client";

import { useEffect, useMemo, useState } from "react";
import { findCommonRoot } from "@/components/file-tree/builder/utils";
import { AddinModel } from "@/lib/models/addin.model";
import { useLibraryStore } from "./store";
import AddinPreview from "./AddinPreview";
import {
  buildTree,
  TreeNode,
} from "@/components/file-tree/builder/tree-builder";
import FileTreeView, { FileTreeRules } from "@/components/file-tree";
import { determineRevitVersions } from "./helpers";
import FailedToDelistAddinDialog from "@/app/shared/FailedToDelistAddinDialog";
import PageWrapper from "@/components/PageWrapper";
import MessageDialog from "@/components/dialogs/MessageDialog";
import ConfirmDelistAddinDialog from "./dialogs/ConfirmDelistAddinDialog";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";

// Type-safe interface for addins with file tree path
interface AddinWithTreePath extends AddinModel {
  fileTreePath: string;
  displayName: string;
}

export default function LibraryPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await useAuthStore.getState().amIAnAdmin();
      setIsAdmin(adminStatus === "admin" || adminStatus === "super");
    };
    checkAdmin();
  }, []);
  const { addins, installAddins, refreshRegistry, delistAddin } =
    useAddinRegistryStore();
  const root = useMemo(() => {
    if (addins.length === 0) {
      console.log("No addins loaded yet");
      return "";
    }
    const paths = addins.map((a) => a.pathToAddinDllFolder);
    const commonRoot = findCommonRoot(paths);
    // console.log("Addin paths:", paths);
    // console.log("Calculated root:", commonRoot);
    return commonRoot;
  }, [addins]);
  const tree = useMemo(() => {
    const addinsWithTreePath: AddinWithTreePath[] = addins.map((addin) => ({
      ...addin,
      fileTreePath: addin.pathToAddinDllFolder,
      displayName: addin.name,
    }));

    return buildTree(addinsWithTreePath, root);
  }, [addins, root]);

  const {
    selectedAddin,
    setSelectedAddin,
    installingAddins,
    setInstallingAddins,
  } = useLibraryStore();

  const handleInstallAddin = async () => {
    if (!selectedAddin) {
      return;
    }
    // Add the addin to the installingAddins list
    setInstallingAddins([...installingAddins, selectedAddin]);
    const request = {
      addin: selectedAddin,
      forRevitVersions: await determineRevitVersions(selectedAddin),
    };
    console.log("reuqest", request);
    const result = await installAddins([request]);
    console.log(result);

    await refreshRegistry();
    // Remove the addin from the installingAddins list
    setInstallingAddins(
      installingAddins.filter(
        (addin) => addin.addinId !== selectedAddin.addinId
      )
    );
    setSelectedAddin({ ...selectedAddin, isInstalledLocally: true });
  };

  const [isFailedToDelistAddinOpen, setIsFailedToDelistAddinOpen] =
    useState(false);
  const [isConfirmDelistDialogOpen, setIsConfirmDelistDialogOpen] =
    useState(false);
  const handleDelistClicked = () => {
    setIsConfirmDelistDialogOpen(true);
  };
  const handleDelistAddin = async () => {
    if (!selectedAddin) {
      return;
    }
    try {
      await delistAddin(selectedAddin);
      await refreshRegistry();
      setSelectedAddin(null);
    } catch (error) {
      console.warn(error);
      setIsFailedToDelistAddinOpen(true);
    }
  };

  useEffect(() => {
    refreshRegistry();
  }, []);

  const fileTreeRules: FileTreeRules = {
    hideFoldersWithName: ["AddinPackages"],
  };

  return (
    <PageWrapper>
      <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
        <div className="flex flex-col h-full w-full min-w-70 ">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold mb-1">Addin Library</h2>
            <p className="text-muted-foreground mb-4">
              Browse and preview available addins. Click a folder to navigate,
              or select an addin to see more details.
            </p>
          </div>
          <div className="flex flex-1 min-h-0 px-8 pb-8 gap-8">
            {/* Left: Tree View */}
            <div className="w-full max-w-md flex-shrink-0 overflow-y-auto thin-scrollbar">
              <FileTreeView
                nodes={tree}
                onSelect={(addin) => setSelectedAddin(addin)}
                nodeName="Addin"
                rules={fileTreeRules}
                treeRoot={root}
              />
            </div>
          </div>
        </div>
        <AddinPreview
          onInstallClicked={handleInstallAddin}
          onDelistClicked={handleDelistClicked}
        />
      </div>
      <FailedToDelistAddinDialog
        isOpen={isFailedToDelistAddinOpen}
        setIsOpen={setIsFailedToDelistAddinOpen}
      />
      <ConfirmDelistAddinDialog
        isOpen={isConfirmDelistDialogOpen}
        setIsOpen={setIsConfirmDelistDialogOpen}
        onOk={handleDelistAddin}
      />
    </PageWrapper>
  );
}
