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
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Callback ref to set up scroll handlers when the element is mounted
  const containerRef = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const scrollSpeed = 5;
      const edgeThreshold = 50; // pixels from edge to trigger scrolling

      // Clear any existing scroll interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }

      // Check if mouse is near left edge
      if (mouseX < edgeThreshold && container.scrollLeft > 0) {
        scrollIntervalRef.current = setInterval(() => {
          container.scrollLeft -= scrollSpeed;
        }, 16); // ~60fps
      }
      // Check if mouse is near right edge
      else if (
        mouseX > containerWidth - edgeThreshold &&
        container.scrollLeft < container.scrollWidth - containerWidth
      ) {
        scrollIntervalRef.current = setInterval(() => {
          container.scrollLeft += scrollSpeed;
        }, 16); // ~60fps
      }
    };

    const handleMouseLeave = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Store cleanup function on the element
    (container as any)._scrollCleanup = () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

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
    <div
      ref={containerRef}
      className="flex flex-row gap-4 w-full items-center h-full justify-center thin-scrollbar overflow-x-auto"
    >
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
