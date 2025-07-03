import { Badge } from "@/components/ui/badge";
import { AddinModel } from "@/lib/models/addin.model";
import { Button } from "@/components/ui/button";

interface AddinCardProps {
  addin: AddinModel;
  onUninstallClicked: () => void;
}

export default function AddinCard({
  addin,
  onUninstallClicked,
}: AddinCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{addin.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{addin.vendor}</p>
          {addin.vendorDescription && (
            <p className="text-sm mt-2">{addin.vendorDescription}</p>
          )}
        </div>
        <div className="flex flex-col justify-between gap-2 items-end">
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{addin.addinType}</Badge>
            {addin.email && (
              <span className="text-xs text-muted-foreground">
                {addin.email}
              </span>
            )}
          </div>

          <Button
            className="text-sm text-destructive"
            onClick={onUninstallClicked}
            variant="link"
          >
            Uninstall
          </Button>
        </div>
      </div>
    </div>
  );
}
