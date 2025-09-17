import { CardContent } from "@/components/ui/card";
import {
  InstalledAddinModel,
  UserStatsModel,
} from "@/lib/models/user-stats.model";
import { Download, Upload } from "lucide-react";
import AddinCard from "../stats-display/stats-by-user/AddinCard";
import { UserStatsWithMetadata } from "@/lib/user-stats/useUserStatsStore";
import { useMemo } from "react";
import getMetadataBodyOrDefault from "@/lib/user-stats/user-stats-util";

interface Props {
  selectedUserStats: UserStatsWithMetadata;
  deduplicatedInstalledAddins: InstalledAddinModel[];
}

export default function InstalledAddinsCardContent({
  selectedUserStats,
  deduplicatedInstalledAddins,
}: Props) {
  const metadataBody = useMemo(() => {
    return getMetadataBodyOrDefault(selectedUserStats.metadata);

  }, [selectedUserStats.metadata]);
  return (
    <CardContent className="pt-0 pb-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold font-sans">App Version</p>
          <p className="text-xs text-muted-foreground font-bold">
            {metadataBody.appVersion}
          </p>
        </div>
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
            <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,12rem))] gap-2 justify-center">
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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,12rem))] gap-2 justify-center">
            {deduplicatedInstalledAddins.map((addin) => {
              return <AddinCard addinInfo={addin} key={addin.addin.name} />;
            })}
          </div>
        </div>
      </div>
    </CardContent>
  );
}
