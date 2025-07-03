import { AddinModel } from "@/lib/models/addin.model";
import { AddinGroup } from "@/app/dashboard/installed/addin-grouping";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useLocalAddins from "@/lib/local-addins/useLocalAddins";
import AddinCard from "./AddinCard";
import { useInstalledAddinsStore } from "./store";

interface AddinGroupCardProps {
  group: AddinGroup;
  refreshAddins: () => Promise<void>;
}

export default function AddinGroupCard({
  group,
  refreshAddins,
}: AddinGroupCardProps) {
  const { uninstallAddins } = useLocalAddins();
  const { setFailedToUninstallAddin } = useInstalledAddinsStore();
  const formatRevitVersions = (versions: string[]) => {
    if (versions.length === 1) {
      return `Revit ${versions[0]}`;
    }

    // Sort versions numerically
    const sortedVersions = versions
      .map((v) => parseInt(v))
      .sort((a, b) => a - b);

    // Check if they're consecutive
    const isConsecutive = sortedVersions.every((version, index) => {
      if (index === 0) return true;
      return version === sortedVersions[index - 1] + 1;
    });

    if (isConsecutive) {
      return `Revit ${sortedVersions[0]}-${
        sortedVersions[sortedVersions.length - 1]
      }`;
    }

    return `Revit ${sortedVersions.join(", ")}`;
  };

  const onUninstallClicked = async (addin: AddinModel) => {
    try {
      await uninstallAddins([{ addin, forRevitVersions: group.revitVersions }]);
    } catch (error) {
      console.warn(error);
      setFailedToUninstallAddin(true);
    } finally {
      await refreshAddins();
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{formatRevitVersions(group.revitVersions)}</span>
          <Badge variant="secondary">
            {group.addins.length} addin{group.addins.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {group.addins.map((addin, index) => (
            <AddinCard
              key={index}
              addin={addin}
              onUninstallClicked={() => onUninstallClicked(addin)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
