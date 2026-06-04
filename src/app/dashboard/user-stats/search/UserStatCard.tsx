import UserAvatar from "@/app/shared/UserAvatar";
import { UserStatsSummaryModel } from "@/lib/models/user-stats.model";
import { Button } from "@/components/ui/button";

interface Props {
  userStats: UserStatsSummaryModel;
  onClick: () => void;
}

export default function UserStatCard({ userStats, onClick }: Props) {
  return (
    <Button className="flex flex-row gap-2 items-center justify-start p-2 font-sans cursor-pointer" onClick={onClick} variant="outline">
      <UserAvatar
        userName={userStats.userName}
        userEmail={userStats.userEmail}
        showFullname={true}
        size="md"
      />
      <p className="text-sm truncate text-muted-foreground font-sans">{userStats.userEmail}</p>
    </Button>
  );
}
