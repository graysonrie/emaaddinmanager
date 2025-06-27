import { AddinModel } from "@/lib/models/addin.model";
import { AddinGroup } from "@/app/dashboard/installed/addin-grouping";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddinGroupCardProps {
  group: AddinGroup;
}

export default function AddinGroupCard({ group }: AddinGroupCardProps) {
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
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{addin.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {addin.vendor}
                  </p>
                  {addin.vendorDescription && (
                    <p className="text-sm mt-2">{addin.vendorDescription}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline">{addin.addinType}</Badge>
                  {addin.email && (
                    <span className="text-xs text-muted-foreground">
                      {addin.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
