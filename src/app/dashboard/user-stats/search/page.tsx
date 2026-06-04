"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserStatsSummaryModel } from "@/lib/models/user-stats.model";
import UserStatCard from "./UserStatCard";
import { useUserStatsSearchStore } from "./useUserStatsSearchStore";
import UserDetailsPage from "./UserDetailsPage";
import ManageDialog from "../manage-dialog";

export default function UserStatsSearchPage() {
  const { refresh, fetchUserDetail } = useUserStatsStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    setSelectedUser,
    selectedUser,
    searchInput,
    setSearchInput,
  } = useUserStatsSearchStore();

  const onStatClick = (user: UserStatsSummaryModel) => {
    setSelectedUser(user);
    // Prefetch the heavy detail for the selected user.
    void fetchUserDetail(user.userEmail);
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
      {selectedUser ? (
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
            {searchResults.map((user) => (
              <UserStatCard
                key={user.userEmail}
                userStats={user}
                onClick={() => onStatClick(user)}
              />
            ))}
          </div>
        </div>
      )}

      <ManageDialog/>
    </PageWrapper>
  );
}
