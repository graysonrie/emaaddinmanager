import PageWrapper from "@/components/PageWrapper";
import { useUserStatsSearchStore } from "./useUserStatsSearchStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Settings2,
  SettingsIcon,
  Upload,
  Download,
  Wrench,
} from "lucide-react";
import UserAvatar from "@/app/shared/UserAvatar";
import { useManageDialogStore } from "../manage-dialog/store";
import { Card, CardContent } from "@/components/ui/card";
import { deduplicateInstalledAddins } from "../stats-display/helpers";
import InstalledAddinsCardContent from "../components/InstalledAddinsCardContent";

export default function UserDetailsPage() {
  const { selectedUserStats, setSelectedUserStats } = useUserStatsSearchStore();
  const manageDialogStore = useManageDialogStore();

  const handleManageUserClick = (userEmail: string, userName: string) => {
    manageDialogStore.setIsVisible(true);
    manageDialogStore.setUserEmailAndName(userEmail, userName);
  };

  if (!selectedUserStats) return null;

  const deduplicatedInstalledAddins = deduplicateInstalledAddins(
    selectedUserStats.installedAddins
  );
  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar p-2">
        <div className="flex flex-row gap-4 items-center">
          <Button
            onClick={() => setSelectedUserStats(null)}
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <ArrowLeft />
          </Button>
          <UserAvatar
            userName={selectedUserStats?.userName}
            userEmail={selectedUserStats?.userEmail || ""}
            size="lg"
            showFullname={true}
          />
        </div>
        <Separator className="w-full" />
        <div className="flex flex-col gap-4 w-full overflow-auto">
          <div className="flex-1 flex flex-col gap-2 items-center">
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() =>
                handleManageUserClick(
                  selectedUserStats?.userEmail || "",
                  selectedUserStats?.userName || ""
                )
              }
            >
              <Wrench />
              <p className="font-sans ">Manage User</p>
            </Button>
            <p className="text-sm text-muted-foreground font-sans">
              Change the addins that this user has access to
            </p>
          </div>
          <Separator className="w-full" />

          <Card>
            <InstalledAddinsCardContent
              selectedUserStats={selectedUserStats}
              deduplicatedInstalledAddins={deduplicatedInstalledAddins}
            />
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
