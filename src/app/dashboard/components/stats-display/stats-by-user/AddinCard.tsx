import { Separator } from "@/components/ui/separator";
import { AddinModel } from "@/lib/models/addin.model";
import { Blocks } from "lucide-react";
interface AddinCardProps {
  addinInfo: {
    addin: AddinModel;
    datePublished?: string;
    dateInstalled?: string;
  };
}

export default function AddinCard({ addinInfo }: AddinCardProps) {
  return (
    <div className="bg-muted shadow-md px-2 py-2 font-sans text-xs rainbow-border flex flex-col gap-2 max-w-48 h-full">
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
      </div>
    </div>
  );
}
