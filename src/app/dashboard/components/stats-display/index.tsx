import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import useUserStats from "@/lib/user-stats/useUserStats";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserAvatar from "@/app/shared/UserAvatar";
import { Loader2 } from "lucide-react";
import BasicUserStatsTable from "./BasicUserStatsTable";
import StatsByUser from "./stats-by-user";
import useMockUserStats from "@/lib/user-stats/useMockUserStats";

export default function StatsDisplay() {

  //   const publishedAddins = useMemo(() => {
  //     if (!userStats || !userEmail) return [];

  //     // Find the user stats for the current user
  //     const currentUserStats = userStats.find(
  //       (stats) => stats.userEmail === userEmail
  //     );

  //     // Return the published addins for that user, or empty array if not found
  //     return currentUserStats?.publishedAddins || [];
  //   }, [userStats, userEmail]);

  //   const installedAddins = useMemo(() => {
  //     if (!userStats || !userEmail) return [] b;

  //     // Find the user stats for the current user
  //     const currentUserStats = userStats.find(
  //       (stats) => stats.userEmail === userEmail
  //     );

  //     // Return the published addins for that user, or empty array if not found
  //     return currentUserStats?.installedAddins || [];
  //   }, [userStats, userEmail]);

  return (
    <div className="flex flex-row gap-4 w-full items-center h-full justify-center overflow-auto">
      <div className="flex flex-col w-full gap-8">
        <div>
          <p className="text-2xl font-bold">Overview</p>
          <BasicUserStatsTable />
        </div>
        <div>
          <p className="text-2xl font-bold">Stats By User</p>
          <StatsByUser />
        </div>
      </div>
    </div>
  );
}
