import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/app/shared/UserAvatar";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { deduplicateInstalledAddins } from "./helpers";
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

  const handleEmailUsersWithoutPassword = useCallback(() => {
    if (!userFacingStats) return;

    // Get all users without passwords
    const usersWithoutPassword = userFacingStats.filter(
      (stats) => passwordStatuses[stats.userEmail] === false
    );

    if (usersWithoutPassword.length === 0) {
      // Could show a toast/notification here if desired
      return;
    }

    // Construct mailto link with all email addresses
    const emailAddresses = usersWithoutPassword
      .map((stats) => stats.userEmail)
      .join(";");

    const subject = encodeURIComponent("Password Setup Required");
    const body = encodeURIComponent(
      `All,\n\nThis is a reminder to update to the latest version of the EMA Addin Launcher (Version 0.9.0)\n\nIf the app does not prompt you for an update, please install the latest version by using the installer located at S:\\Autodesk\\Addins\\EMA\\EMA.Addin.Launcher_0.9.0_x64_en-US.msi\n\nThank you.`
    );

    const mailtoLink = `mailto:${emailAddresses}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  }, [userFacingStats, passwordStatuses]);

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

  // Count users without passwords
  const usersWithoutPasswordCount = useMemo(() => {
    if (!userFacingStats) return 0;
    return userFacingStats.filter(
      (stats) => passwordStatuses[stats.userEmail] === false
    ).length;
  }, [userFacingStats, passwordStatuses]);

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
    <div className="flex flex-col gap-4 font-sans w-full items-center h-full justify-center">
      <div className="flex flex-row gap-4 w-full items-center h-full justify-center thin-scrollbar overflow-x-auto">
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
      {usersWithoutPasswordCount > 0 && (
        <div className="flex justify-center w-full">
          <Button
            onClick={handleEmailUsersWithoutPassword}
            variant="outline"
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Users Without Password ({usersWithoutPasswordCount})
          </Button>
        </div>
      )}
    </div>
  );
}
