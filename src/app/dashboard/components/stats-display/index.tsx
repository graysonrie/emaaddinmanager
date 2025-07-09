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

interface UserFacingStats {
  userName: string;
  publishedAddins: number;
  installedAddins: number;
  disciplines: string[];
}

export default function StatsDisplay() {
  const { userStats, loading, error, refresh } = useUserStats();
  const userEmail = useKeyValueSubscription<string>("userEmail");

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
  //     if (!userStats || !userEmail) return [];

  //     // Find the user stats for the current user
  //     const currentUserStats = userStats.find(
  //       (stats) => stats.userEmail === userEmail
  //     );

  //     // Return the published addins for that user, or empty array if not found
  //     return currentUserStats?.installedAddins || [];
  //   }, [userStats, userEmail]);

  return (
    <div className="flex flex-row gap-4 w-full items-center h-full justify-center">
      <div className="flex flex-col w-full">
        <p className="text-2xl font-bold">Overview</p>
        <BasicUserStatsTable />
      </div>
    </div>
  );
}
