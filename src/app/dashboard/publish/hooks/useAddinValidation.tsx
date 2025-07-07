import { useCallback, useEffect, useState } from "react";
import { SimplifiedAddinInfoModel } from "@/lib/models/simplified-addin-info.model";
import useAddinRegistry from "@/lib/addin-registry/useAddinRegistry";
import { getParentDirectoryFromPath } from "@/lib/utils";
import { getAddinCsharpProjectName } from "@/lib/models/addin.model";

export default function useAddinValidation(
  addinFileInfo: SimplifiedAddinInfoModel | null
) {
  const { addins } = useAddinRegistry();
  const [overrideDestinationPath, setOverrideDestinationPath] = useState<
    string | undefined
  >(undefined);

  // Returns addins in the registry that match the addin that the user is trying to publish.
  // This indicates that the user is trying to update an addin that already exists in the registry.
  const existingAddinsInRegistry = useCallback(() => {
    if (!addinFileInfo) {
      console.warn("Addin file info is not set");
      return undefined;
    }
    const existing = addins.find((a) => {
      const csharpProjectName = getAddinCsharpProjectName(a);
      // console.log("csharpProjectName", csharpProjectName);
      // console.log("addinFileInfo.csharpProjectName", addinFileInfo.csharpProjectName);
      return csharpProjectName === addinFileInfo.csharpProjectName;
    });
    return existing;
  }, [addinFileInfo, addins]);

  const isAllAddinInfoFilled = () => {
    if (!addinFileInfo) {
      return false;
    }
    return (
      addinFileInfo.name &&
      addinFileInfo.description &&
      addinFileInfo.vendorId &&
      addinFileInfo.email
    );
  };

  useEffect(() => {
    const existingAddin = existingAddinsInRegistry();
    if (existingAddin) {
      console.log("existingAddin", existingAddin);
      const parentDirectory = getParentDirectoryFromPath(
        existingAddin.pathToAddinDllFolder
      );
      console.log("parentDirectory", parentDirectory);
      setOverrideDestinationPath(parentDirectory);
    } else {
      setOverrideDestinationPath(undefined);
    }
  }, [existingAddinsInRegistry]);

  return {
    existingAddinsInRegistry,
    isAllAddinInfoFilled,
    overrideDestinationPath,
  };
}
