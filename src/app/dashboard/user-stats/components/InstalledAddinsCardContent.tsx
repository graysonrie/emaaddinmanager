import { CardContent } from "@/components/ui/card";
import { InstalledAddinModel, UserStatsModel } from "@/lib/models/user-stats.model";
import { Download, Upload } from "lucide-react";
import AddinCard from "../stats-display/stats-by-user/AddinCard";


interface Props {
    selectedUserStats: UserStatsModel;
    deduplicatedInstalledAddins: InstalledAddinModel[];
}

export default function InstalledAddinsCardContent({ selectedUserStats, deduplicatedInstalledAddins }: Props) {
  return (
    <CardContent className="pt-0 pb-2">
      <div className="flex flex-col gap-4">
        {selectedUserStats.publishedAddins.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 items-center">
              <Upload className="w-4 h-4 flex-shrink-0" />
              <div className="flex flex-row gap-2 items-center">
                <p className="text-sm font-bold font-sans">Published Addins</p>
                <p className="text-xs text-muted-foreground">
                  ({selectedUserStats.publishedAddins.length})
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {selectedUserStats.publishedAddins.map((addin) => {
                return <AddinCard addinInfo={addin} key={addin.addin.name} />;
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <Download className="w-4 h-4 flex-shrink-0" />
            <div className="flex flex-row gap-2 items-center">
              <p className="text-sm font-bold font-sans">Installed Addins</p>
              <p className="text-xs text-muted-foreground">
                ({deduplicatedInstalledAddins.length})
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {deduplicatedInstalledAddins.map((addin) => {
              return <AddinCard addinInfo={addin} key={addin.addin.name} />;
            })}
          </div>
        </div>
      </div>
    </CardContent>
  );
}
