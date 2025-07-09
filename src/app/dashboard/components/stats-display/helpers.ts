import { InstalledAddinModel } from "@/lib/models/user-stats.model";

export function deduplicateInstalledAddins(installedAddins: InstalledAddinModel[]): InstalledAddinModel[] {
  const addinGroups = new Map<string, InstalledAddinModel[]>();
  
  // Group addins by name
  for (const addin of installedAddins) {
    const addinName = addin.addin.name;
    if (!addinGroups.has(addinName)) {
      addinGroups.set(addinName, []);
    }
    addinGroups.get(addinName)!.push(addin);
  }
  
  // Process each group to create deduplicated addins with combined versions
  const deduplicatedAddins: InstalledAddinModel[] = [];
  
  for (const [addinName, addinGroup] of addinGroups) {
    if (addinGroup.length === 1) {
      // Single addin, keep as is
      deduplicatedAddins.push(addinGroup[0]);
    } else {
      // Multiple addins with same name, combine versions
      const versions = addinGroup
        .map(addin => addin.addin.revitVersion)
        .filter(version => version !== null)
        .sort();
      
      if (versions.length > 0) {
        const minVersion = versions[0];
        const maxVersion = versions[versions.length - 1];
        const combinedVersion = minVersion === maxVersion ? minVersion : `${minVersion}-${maxVersion}`;
        
        // Create a new addin with combined version
        const baseAddin = addinGroup[0];
        const combinedAddin: InstalledAddinModel = {
          ...baseAddin,
          addin: {
            ...baseAddin.addin,
            revitVersion: combinedVersion
          }
        };
        
        deduplicatedAddins.push(combinedAddin);
      } else {
        // No versions, keep the first addin
        deduplicatedAddins.push(addinGroup[0]);
      }
    }
  }
  
  return deduplicatedAddins;
}