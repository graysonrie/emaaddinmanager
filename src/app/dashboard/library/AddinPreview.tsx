import { Button } from "@/components/ui/button";
import { useLibraryStore } from "./store";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { determineRevitVersions } from "./helpers";
import { AddinModel } from "@/lib/models/addin.model";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import useLocalAddins from "@/lib/local-addins/useLocalAddins";

interface AddinPreviewProps {
  onInstallClicked?: () => void;
  onDelistClicked?: () => void;
}

export default function AddinPreview({
  onInstallClicked,
  onDelistClicked,
}: AddinPreviewProps) {
  const {
    selectedAddin,
    setSelectedAddin,
    installingAddins,
    setFailedToUninstallAddin,
  } = useLibraryStore();

  const { uninstallAddins } = useLocalAddins();

  const userEmail = useConfigValue("userEmail");
  const [revitVersions, setRevitVersions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedAddin) {
      setRevitVersions([]);
      determineRevitVersions(selectedAddin).then(setRevitVersions);
    }
  }, [selectedAddin]);

  const isInstalling = installingAddins.some(
    (addin) => addin.addinId === selectedAddin?.addinId
  );

  const installButton = (selectedAddin: AddinModel) => (
    <div className="flex">
      {selectedAddin.isInstalledLocally ? (
        <div className="w-full justify-center items-center flex gap-2">
          <CheckCircle className="w-4 h-4" />
          Installed
        </div>
      ) : (
        <Button className="w-full cursor-pointer" onClick={onInstallClicked}>
          Install
        </Button>
      )}
    </div>
  );

  const onUninstallClicked = async () => {
    if (!selectedAddin) {
      return;
    }
    try {
      await uninstallAddins([
        { addin: selectedAddin, forRevitVersions: revitVersions },
      ]);
    } catch (error) {
      console.warn(error);
      setFailedToUninstallAddin(true);
    } finally {
      setSelectedAddin({ ...selectedAddin, isInstalledLocally: false });
    }
  };

  const uninstallButton = (selectedAddin: AddinModel) => (
    <div>
      {selectedAddin.isInstalledLocally ? (
        <Button
          className="w-full cursor-pointer"
          variant="outline"
          onClick={onUninstallClicked}
        >
          Uninstall
        </Button>
      ) : null}
    </div>
  );

  const delistButton = (selectedAddin: AddinModel) => (
    <div className="flex">
      {userEmail === selectedAddin.email ? (
        <Button
          className="w-full cursor-pointer"
          variant="destructive"
          onClick={onDelistClicked}
        >
          Delist
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-1 bg-card border-l p-6 min-w-[300px] max-w-xl shadow-sm h-full overflow-auto font-sans">
      {selectedAddin ? (
        <div className="flex flex-col gap-4 justify-between h-full w-full">
          <div>
            <h3 className="text-xl font-semibold mb-2">{selectedAddin.name}</h3>
            <div className="space-y-2">
              {/* TODO: Add version. Currently, the backend sets 1.0.0 for all addins. This is not correct. */}
              {/* <div>
                <span className="font-medium">Version:</span>{" "}
                {selectedAddin.version}
              </div> */}
              <div>
                <span className="font-medium">Vendor:</span>{" "}
                {selectedAddin.vendor}
              </div>
              {selectedAddin.email && (
                <div>
                  <span className="font-medium">Owner:</span>{" "}
                  {selectedAddin.email}
                </div>
              )}
              <div>
                <span className="font-medium">Type:</span>{" "}
                {selectedAddin.addinType}
              </div>
              <div>
                <span className="font-medium">Description:</span>{" "}
                {selectedAddin.vendorDescription}
              </div>
              {revitVersions.length > 0 && (
                <div className="gap-2 text-sm text-muted-foreground">
                  <span>Compatible with:</span> {revitVersions.join(", ")}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-col">
            {isInstalling ? (
              <div className="w-full justify-center items-center flex gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Installing...
              </div>
            ) : (
              <>
                {installButton(selectedAddin)}
                {uninstallButton(selectedAddin)}
                {delistButton(selectedAddin)}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <span className="text-lg mb-2">No addin selected</span>
          <span className="text-sm">
            Select an addin from the list to see its details.
          </span>
        </div>
      )}
    </div>
  );
}
