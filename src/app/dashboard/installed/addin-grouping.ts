import { AddinModel } from "../../../lib/models/addin.model";

export interface AddinGroup {
  revitVersions: string[];
  addins: AddinModel[];
}

export function groupAddinsByRevitVersions(addins: AddinModel[]): AddinGroup[] {
  // Step 1: Group by addin identity, collect all versions for each addin
  const addinIdentityMap = new Map<
    string,
    { addin: AddinModel; versions: Set<string> }
  >();

  for (const addin of addins) {
    const key = `${addin.name}::${addin.vendor}::${addin.addinType}`;
    if (!addinIdentityMap.has(key)) {
      addinIdentityMap.set(key, { addin, versions: new Set() });
    }
    addinIdentityMap.get(key)!.versions.add(addin.revitVersion!);
  }

  // Step 2: Group addins by their set of versions
  const versionSetMap = new Map<
    string, // key: sorted, joined versions
    { revitVersions: string[]; addins: AddinModel[] }
  >();

  for (const { addin, versions } of addinIdentityMap.values()) {
    const sortedVersions = Array.from(versions).sort();
    const versionKey = sortedVersions.join(",");
    if (!versionSetMap.has(versionKey)) {
      versionSetMap.set(versionKey, {
        revitVersions: sortedVersions,
        addins: [],
      });
    }
    versionSetMap.get(versionKey)!.addins.push(addin);
  }

  // Convert to AddinGroup[]
  const result: AddinGroup[] = Array.from(versionSetMap.values());

  // Sort by first version
  result.sort((a, b) => {
    const aFirst = parseInt(a.revitVersions[0]);
    const bFirst = parseInt(b.revitVersions[0]);
    return aFirst - bFirst;
  });

  return result;
}
