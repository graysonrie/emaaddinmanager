import { useKeyValueSubscription } from "@/lib/persistence/useKeyValueSubscription";
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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { deduplicateInstalledAddins } from "./helpers";
import useMockUserStats from "@/lib/user-stats/useMockUserStats";
import { useManageDialogStore } from "../manage-dialog/store";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import getMetadataBodyOrDefault from "@/lib/user-stats/user-stats-util";
import { MetadataBody } from "@/lib/models/user-metadata.model";
import getTauriCommands from "@/lib/commands/getTauriCommands";

interface UserFacingStats {
  userEmail: string;
  userName: string;
  publishedAddins: number;
  installedAddins: number;
  disciplines: string[];
  metadataBody: MetadataBody;
}

interface PasswordStatus {
  [userEmail: string]: boolean | null; // null = loading, true = has password, false = no password
}

export default function BasicUserStatsTable() {
  const { userStats, loading, error, refresh } = useUserStatsStore();
  const { loginCheckIfPasswordIsSetForUser } = getTauriCommands();
  const [passwordStatuses, setPasswordStatuses] = useState<PasswordStatus>({});
  const manageDialogStore = useManageDialogStore();

  const handleUserAvatarClick = (userEmail: string, userName: string) => {
    manageDialogStore.setIsVisible(true);
    manageDialogStore.setUserEmailAndName(userEmail, userName);
  };

  const userFacingStats = useMemo(() => {
    return userStats?.map((stats) => {
      const deduplicatedInstalledAddins = deduplicateInstalledAddins(
        stats.installedAddins
      );
      const userFacingStats: UserFacingStats = {
        userEmail: stats.userEmail,
        userName: stats.userName,
        publishedAddins: stats.publishedAddins.length,
        installedAddins: deduplicatedInstalledAddins.length,
        disciplines: stats.disciplines,
        metadataBody: getMetadataBodyOrDefault(stats.metadata),
      };
      return userFacingStats;
    });
  }, [userStats]);

  // Check password status for all users
  useEffect(() => {
    const checkPasswords = async () => {
      if (!userFacingStats || userFacingStats.length === 0) return;

      const statuses: PasswordStatus = {};

      // Initialize all as loading
      userFacingStats.forEach((stats) => {
        statuses[stats.userEmail] = null;
      });
      setPasswordStatuses(statuses);

      // Check each user's password status
      const checks = userFacingStats.map(async (stats) => {
        try {
          const hasPassword = await loginCheckIfPasswordIsSetForUser(
            stats.userEmail
          );
          return { userEmail: stats.userEmail, hasPassword };
        } catch (err) {
          console.error(
            `Failed to check password for ${stats.userEmail}:`,
            err
          );
          return { userEmail: stats.userEmail, hasPassword: false };
        }
      });

      const results = await Promise.all(checks);
      const updatedStatuses: PasswordStatus = {};
      results.forEach((result) => {
        updatedStatuses[result.userEmail] = result.hasPassword;
      });
      setPasswordStatuses(updatedStatuses);
    };

    checkPasswords();
    // loginCheckIfPasswordIsSetForUser is stable from getTauriCommands, so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFacingStats]);

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
    <div className="flex flex-row gap-4 font-sans w-full items-center h-full justify-center thin-scrollbar overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Password Set</TableHead>
            <TableHead>Addins Installed</TableHead>
            <TableHead>App Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userFacingStats?.map((stats) => {
            const hasPassword = passwordStatuses[stats.userEmail];
            return (
              <TableRow key={stats.userEmail}>
                <TableCell>
                  <UserAvatar
                    userName={stats.userName}
                    userEmail={stats.userEmail}
                    showFullname={true}
                    size="sm"
                    onClick={() =>
                      handleUserAvatarClick(stats.userEmail, stats.userName)
                    }
                  />
                </TableCell>
                <TableCell>
                  {hasPassword === null ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : hasPassword ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>{stats.installedAddins}</TableCell>
                <TableCell>{stats.metadataBody.appVersion}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
