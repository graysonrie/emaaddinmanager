"use client";

import { useMemo } from "react";
import useLocalAddins from "@/lib/local-addins/useLocalAddins";
import { groupAddinsByRevitVersions } from "@/app/dashboard/installed/addin-grouping";
import AddinGroupCard from "./AddinGroupCard";

/** Page for the user's locally installed addins
 *
 * Should have categories for different versions of Revit (2024, 2025, etc.)
 * Should also have a category for addins that are installed in every version of Revit (all)
 */
export default function InstalledPage() {
  const { addins, loading, error, refreshAddins } = useLocalAddins();

  const groupedAddins = useMemo(() => {
    return groupAddinsByRevitVersions(addins);
  }, [addins]);

  if (loading) {
    return (
      <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
        <div className="flex flex-col h-full w-full bg-background">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold mb-1">Installed Addins</h2>
            <p className="text-muted-foreground mb-4">
              Loading your locally installed addins...
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
        <div className="flex flex-col h-full w-full bg-background">
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-2xl font-bold mb-1">Installed Addins</h2>
            <p className="text-muted-foreground mb-4">
              Error loading your locally installed addins.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-destructive text-center">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={refreshAddins}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 px-8 gap-8 h-full">
      <div className="flex flex-col h-full w-full max-w-screen-lg mx-auto bg-background">
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold mb-1">Installed Addins</h2>
          <p className="text-muted-foreground mb-4">
            Your locally installed Revit addins, grouped by Revit versions.
          </p>
        </div>
        <div className="flex-1 min-h-0 px-8 pb-8 overflow-auto">
          {groupedAddins.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">No addins found</p>
                <p className="text-sm">
                  No locally installed addins were detected. Make sure you have
                  Revit addins installed in the standard location.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedAddins.map((group, index) => (
                <AddinGroupCard key={index} group={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
