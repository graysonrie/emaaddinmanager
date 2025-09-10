import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import { AddinModel } from "@/lib/models/addin.model";

export interface VersionCheckResponse {
  isOutdated: boolean;
  latestVersion: string;
}

export default function useAddinVersionChecker() {
  const checkVersion = (addin: AddinModel): VersionCheckResponse => {
    const addins = useAddinRegistryStore.getState().addins;
    const addinInRegistry = addins.find((a) => a.name === addin.name);
    if (!addinInRegistry) {
      // Addin does not exist
      return {
        isOutdated: false,
        latestVersion: "Unknown",
      };
    }
    const addinVersion = addin.version === "1.0.0" ? "0" : addin.version;
    return {
      isOutdated: addinInRegistry.version !== addinVersion,
      latestVersion: addinInRegistry.version,
    };
  };
  return { checkVersion };
}
