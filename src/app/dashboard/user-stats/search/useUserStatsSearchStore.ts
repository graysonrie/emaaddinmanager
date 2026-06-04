import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { UserStatsSummaryModel } from "@/lib/models/user-stats.model";
import { create } from "zustand";

interface UserStatsSearchStore {
  searchResults: UserStatsSummaryModel[];
  setSearchResults: (searchResults: UserStatsSummaryModel[]) => void;
  selectedUser: UserStatsSummaryModel | null;
  setSelectedUser: (user: UserStatsSummaryModel | null) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
}

export const useUserStatsSearchStore = create<UserStatsSearchStore>((set) => ({
  searchResults: [],
  setSearchResults: (searchResults: UserStatsSummaryModel[]) =>
    set({ searchResults }),
  selectedUser: null,
  setSelectedUser: (user: UserStatsSummaryModel | null) =>
    set({ selectedUser: user }),
  searchInput: "",
  setSearchInput: (searchInput: string) => {
    const { summaries } = useUserStatsStore.getState();
    const filteredUserStats = summaries.filter(
      (summary) =>
        summary.userName.toLowerCase().includes(searchInput.toLowerCase()) ||
        summary.userEmail.toLowerCase().includes(searchInput.toLowerCase())
    );
    set({ searchResults: filteredUserStats });
    set({ searchInput: searchInput });
  },
}));
