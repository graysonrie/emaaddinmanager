"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { UserStatsWithMetadata, useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserStatsModel } from "@/lib/models/user-stats.model";
import UserStatCard from "./UserStatCard";
import { useUserStatsSearchStore } from "./useUserStatsSearchStore";
import UserDetailsPage from "./UserDetailsPage";
import ManageDialog from "../manage-dialog";

export default function UserStatsSearchPage() {
  const { refresh, userStats } = useUserStatsStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    setSearchResults,
    setSelectedUserStats,
    selectedUserStats,
    searchInput,
    setSearchInput,
  } = useUserStatsSearchStore();

  const onStatClick = (userStats: UserStatsWithMetadata) => {
    setSelectedUserStats(userStats);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Show main app content
  return (
    <PageWrapper>
      {selectedUserStats ? (
        <UserDetailsPage />
      ) : (
        <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar p-2">
          <div className="flex flex-row gap-4 items-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft />
            </Button>
            <p className="text-2xl font-bold">Search for user</p>
          </div>
          <Separator className="w-full" />
          <div>
            <div className="flex flex-row gap-2 items-center">
              <Search className="size-4 shrink-0" />
              <Input
                ref={inputRef}
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {searchResults.map((userStats) => (
              <UserStatCard
                key={userStats.userEmail}
                userStats={userStats}
                onClick={() => onStatClick(userStats)}
              />
            ))}
          </div>
        </div>
      )}

      <ManageDialog/>
    </PageWrapper>
  );
}
