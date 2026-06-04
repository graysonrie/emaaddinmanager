import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/app/shared/UserAvatar";
import { useMemo, useState } from "react";
import { useManageDialogStore } from "../../manage-dialog/store";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import InstalledAddinsCardContent from "../../components/InstalledAddinsCardContent";
import { deduplicateInstalledAddins } from "../helpers";
import { UserStatsSummaryModel } from "@/lib/models/user-stats.model";

export default function StatsByUser() {
  const { summaries, loading, error } = useUserStatsStore();

  const manageDialogStore = useManageDialogStore();

  const handleUserAvatarClick = (userEmail: string, userName: string) => {
    manageDialogStore.setIsVisible(true);
    manageDialogStore.setUserEmailAndName(userEmail, userName);
  };

  if (loading)
    return (
      <div className="flex flex-row gap-4 w-full items-center h-full justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-row gap-4 w-full items-center h-full justify-center">
        <p className="text-sm text-muted-foreground">Error: {error}</p>
      </div>
    );
  return (
    <div className="flex flex-col gap-4 w-full items-center h-full thin-scrollbar p-2">
      {summaries?.map((summary) => (
        <UserStatsRow
          key={summary.userEmail}
          summary={summary}
          onAvatarClick={handleUserAvatarClick}
        />
      ))}
    </div>
  );
}

interface UserStatsRowProps {
  summary: UserStatsSummaryModel;
  onAvatarClick: (userEmail: string, userName: string) => void;
}

function UserStatsRow({ summary, onAvatarClick }: UserStatsRowProps) {
  const { detailByEmail, fetchUserDetail } = useUserStatsStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const detail = detailByEmail[summary.userEmail];

  const deduplicatedInstalledAddins = useMemo(
    () => (detail ? deduplicateInstalledAddins(detail.installedAddins) : []),
    [detail]
  );

  const toggleExpansion = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    // Lazily load the heavy addin data only when the row is opened.
    if (next && !detail) {
      void fetchUserDetail(summary.userEmail);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Card className="p-1 pt-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <UserAvatar
                userName={summary.userName}
                userEmail={summary.userEmail}
                showFullname={true}
                size="md"
                onClick={() =>
                  onAvatarClick(summary.userEmail, summary.userName)
                }
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">
                  {summary.userEmail}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpansion}
              className="flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs">Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-xs">Expand</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded &&
          (detail ? (
            <InstalledAddinsCardContent
              selectedUserStats={detail}
              appVersion={summary.appVersion}
              deduplicatedInstalledAddins={deduplicatedInstalledAddins}
            />
          ) : (
            <CardContent className="pt-0 pb-2">
              <div className="flex flex-row gap-2 w-full items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </CardContent>
          ))}
      </Card>
    </div>
  );
}
