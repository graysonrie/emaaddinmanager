import { UserStatsModel } from "@/lib/models/user-stats.model";
import { useUserStatsStore } from "@/lib/user-stats/useUserStatsStore";
import { create } from "zustand";

interface UserStatsSearchStore {
  searchResults: UserStatsModel[];
  setSearchResults: (searchResults: UserStatsModel[]) => void;
  selectedUserStats: UserStatsModel | null;
  setSelectedUserStats: (userStats: UserStatsModel | null) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
}

export const useUserStatsSearchStore = create<UserStatsSearchStore>((set) => ({
  searchResults: [],
  setSearchResults: (searchResults: UserStatsModel[]) => set({ searchResults }),
  selectedUserStats: null,
  setSelectedUserStats: (userStats: UserStatsModel | null) =>
    set({ selectedUserStats: userStats }),
  searchInput: "",
  setSearchInput: (searchInput: string) => {
    const { userStats } = useUserStatsStore.getState();
    const filteredUserStats = userStats.filter((userStats) =>
      userStats.userName.toLowerCase().includes(searchInput.toLowerCase()) || userStats.userEmail.toLowerCase().includes(searchInput.toLowerCase())
    );
    set({ searchResults: filteredUserStats });
    set({ searchInput: searchInput });
  },
}));
