import PageWrapper from "@/components/PageWrapper";
import { useUserStatsSearchStore } from "./useUserStatsSearchStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Wrench } from "lucide-react";
import UserAvatar from "@/app/shared/UserAvatar";
import { useManageDialogStore } from "../manage-dialog/store";
import { Card, CardContent } from "@/components/ui/card";
import { deduplicateInstalledAddins } from "../stats-display/helpers";
import InstalledAddinsCardContent from "../components/InstalledAddinsCardContent";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { useMemo } from "react";

export default function UserDetailsPage() {
  const { selectedUser, setSelectedUser } = useUserStatsSearchStore();
  const { detailByEmail } = useUserStatsStore();
  const manageDialogStore = useManageDialogStore();

  const handleManageUserClick = (userEmail: string, userName: string) => {
    manageDialogStore.setIsVisible(true);
    manageDialogStore.setUserEmailAndName(userEmail, userName);
  };

  const detail = selectedUser
    ? detailByEmail[selectedUser.userEmail]
    : undefined;

  const deduplicatedInstalledAddins = useMemo(
    () => (detail ? deduplicateInstalledAddins(detail.installedAddins) : []),
    [detail]
  );

  if (!selectedUser) return null;

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar p-2">
        <div className="flex flex-row gap-4 items-center">
          <Button
            onClick={() => setSelectedUser(null)}
            variant="outline"
            size="icon"
            className="cursor-pointer"
          >
            <ArrowLeft />
          </Button>
          <UserAvatar
            userName={selectedUser.userName}
            userEmail={selectedUser.userEmail || ""}
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
                  selectedUser.userEmail || "",
                  selectedUser.userName || ""
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
            {detail ? (
              <InstalledAddinsCardContent
                selectedUserStats={detail}
                appVersion={selectedUser.appVersion}
                deduplicatedInstalledAddins={deduplicatedInstalledAddins}
              />
            ) : (
              <CardContent className="pt-6 pb-2">
                <div className="flex flex-row gap-2 w-full items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
