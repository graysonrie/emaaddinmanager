import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
import useUserStats from "@/lib/user-stats/useUserStats";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
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

interface UserFacingStats {
  userEmail: string;
  userName: string;
  publishedAddins: number;
  installedAddins: number;
  disciplines: string[];
}

export default function BasicUserStatsTable() {
  const { userStats, loading, error, refresh } = useUserStats();

  const userFacingStats = useMemo(() => {
    return userStats?.map((stats) => {
      const userFacingStats: UserFacingStats = {
        userEmail: stats.userEmail,
        userName: stats.userName,
        publishedAddins: stats.publishedAddins.length,
        installedAddins: stats.installedAddins.length,
        disciplines: stats.disciplines,
      };
      return userFacingStats;
    });
  }, [userStats]);

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
    <div className="flex flex-row gap-4 w-full items-center h-full justify-center thin-scrollbar overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Addins Published</TableHead>
            <TableHead>Addins Installed</TableHead>
            <TableHead>Discipline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userFacingStats?.map((stats) => (
            <TableRow key={stats.userEmail}>
              <TableCell>
                <UserAvatar
                  userName={stats.userName}
                  showFullname={true}
                  size="sm"
                />
              </TableCell>
              <TableCell>{stats.publishedAddins}</TableCell>
              <TableCell>{stats.installedAddins}</TableCell>
              <TableCell>{stats.disciplines.join(", ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
