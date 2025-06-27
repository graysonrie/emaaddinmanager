import { AddinModel } from "../../../lib/models/addin.model";

export interface AddinGroup {
  revitVersions: string[];
  addins: AddinModel[];
}

export function groupAddinsByRevitVersions(addins: AddinModel[]): AddinGroup[] {
  // Group by name, vendor, and addinType
  const addinGroups = new Map<
    string,
    { addin: AddinModel; revitVersions: Set<string> }
  >();

  for (const addin of addins) {
    const key = `${addin.name}::${addin.vendor}::${addin.addinType}`;
    if (addinGroups.has(key)) {
      addinGroups.get(key)!.revitVersions.add(addin.revitVersion!);
    } else {
      addinGroups.set(key, {
        addin,
        revitVersions: new Set([addin.revitVersion!]),
      });
    }
  }

  // Convert to AddinGroup[]
  const result: AddinGroup[] = [];
  for (const { addin, revitVersions } of addinGroups.values()) {
    result.push({
      revitVersions: Array.from(revitVersions).sort(),
      addins: [addin],
    });
  }

  // Sort by first version
  result.sort((a, b) => {
    const aFirst = parseInt(a.revitVersions[0]);
    const bFirst = parseInt(b.revitVersions[0]);
    return aFirst - bFirst;
  });

  return result;
}
