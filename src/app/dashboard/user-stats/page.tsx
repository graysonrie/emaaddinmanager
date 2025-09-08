"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "../components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import StatsDisplay from "./stats-display";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ManageDialog from "./manage-dialog";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { Button } from "@/components/ui/button";

export default function UserStatsPage() {
  const { refresh } = useUserStatsStore();
  const router = useRouter();

  useEffect(() => {
    refresh();
  }, []);

  // Show main app content
  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar p-2">
        <div className="flex flex-row gap-2 justify-between">
          <p className="text-2xl font-bold">User Stats</p>
          <Button onClick={() => router.push("/dashboard/user-stats/search")}>
            <Search />
            <p className="font-sans">Search for user</p>
          </Button>
        </div>
        <Separator className="w-full" />

        <StatsDisplay />
      </div>
      <ManageDialog />
    </PageWrapper>
  );
}
