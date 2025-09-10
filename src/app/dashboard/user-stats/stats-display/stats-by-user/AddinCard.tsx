import { Separator } from "@/components/ui/separator";
import { AddinModel } from "@/lib/models/addin.model";
import { Blocks, CheckCircle2, InfoIcon } from "lucide-react";
import { useMemo } from "react";
import useAddinVersionChecker from "../hooks/useAddinVersionChecker";
import CustomTooltip from "@/components/CustomTooltip";
interface AddinCardProps {
  addinInfo: {
    addin: AddinModel;
    datePublished?: string;
    dateInstalled?: string;
  };
}

export default function AddinCard({ addinInfo }: AddinCardProps) {
  const getDisplayVersion = useMemo(() => {
    return addinInfo.addin.version === "1.0.0" ? "0" : addinInfo.addin.version;
  }, [addinInfo.addin.version]);
  const versionChecker = useAddinVersionChecker();
  const { isOutdated, latestVersion } = versionChecker.checkVersion(
    addinInfo.addin
  );
  return (
    <div className="bg-muted shadow-md px-2 py-2 font-sans text-xs rainbow-border flex flex-col gap-2 min-w-32 max-w-48 h-full">
      <div className="flex flex-row gap-2 items-center">
        <Blocks className="w-4 h-4 flex-shrink-0" />
        <p className="font-bold font-sans text-sm">{addinInfo.addin.name}</p>
      </div>
      <div className="flex flex-row gap-2 items-center">
        {addinInfo.datePublished && (
          <div>
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-xs text-muted-foreground">
              {addinInfo.datePublished}
            </p>
          </div>
        )}
        {addinInfo.dateInstalled && (
          <div>
            <p className="text-xs text-muted-foreground">Revit Version</p>
            <p className="text-xs text-muted-foreground">
              {addinInfo.addin.revitVersion}
            </p>
          </div>
        )}
        <div className="flex flex-row gap-2 items-center">
          <p className="text-xs text-muted-foreground">Version:</p>
          <p
            className={`text-xs font-bold ${
              isOutdated ? "text-destructive" : "text-primary"
            }`}
          >
            {getDisplayVersion}
          </p>
          {isOutdated ? (
            <CustomTooltip
              content={`Latest version: ${latestVersion}`}
              side="top"
            >
              <InfoIcon className="w-4 h-4 flex-shrink-0 text-destructive cursor-help" />
            </CustomTooltip>
          ) : (
            <CustomTooltip content={`Up to date!`} side="top">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary cursor-help" />
            </CustomTooltip>
          )}
        </div>
      </div>
    </div>
  );
}
