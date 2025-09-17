import {
  useUserStatsStore,
  UserStatsWithMetadata,
} from "@/lib/user-stats/useUserStatsStore";
import { create } from "zustand";

interface UserStatsSearchStore {
  searchResults: UserStatsWithMetadata[];
  setSearchResults: (searchResults: UserStatsWithMetadata[]) => void;
  selectedUserStats: UserStatsWithMetadata | null;
  setSelectedUserStats: (userStats: UserStatsWithMetadata | null) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
}

export const useUserStatsSearchStore = create<UserStatsSearchStore>((set) => ({
  searchResults: [],
  setSearchResults: (searchResults: UserStatsWithMetadata[]) =>
    set({ searchResults }),
  selectedUserStats: null,
  setSelectedUserStats: (userStats: UserStatsWithMetadata | null) =>
    set({ selectedUserStats: userStats }),
  searchInput: "",
  setSearchInput: (searchInput: string) => {
    const { userStats } = useUserStatsStore.getState();
    const filteredUserStats = userStats.filter(
      (userStats) =>
        userStats.userName.toLowerCase().includes(searchInput.toLowerCase()) ||
        userStats.userEmail.toLowerCase().includes(searchInput.toLowerCase())
    );
    set({ searchResults: filteredUserStats });
    set({ searchInput: searchInput });
  },
}));
