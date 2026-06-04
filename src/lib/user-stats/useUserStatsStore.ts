import { create } from "zustand";
import {
  UserStatsModel,
  UserStatsSummaryModel,
} from "../models/user-stats.model";
import getTauriCommands from "../commands/getTauriCommands";
import { useAddinRegistryStore } from "../addins/addin-registry/useAddinRegistryStore";

interface UserStatsStore {
  // State
  /** Lightweight list of all users used for overview/list/search views. */
  summaries: UserStatsSummaryModel[];
  /** Cache of full per-user stats, populated on demand. Keyed by email. */
  detailByEmail: Record<string, UserStatsModel>;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSummaries: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Fetches (and caches) the full stats for a single user. */
  fetchUserDetail: (userEmail: string) => Promise<UserStatsModel | undefined>;
  doesUserExist: (email: string) => Promise<boolean>;
  createUserStats: () => Promise<UserStatsModel>;
  updateUserStats: () => Promise<UserStatsModel | undefined>;
  changeUserStatsEmail: (newUserEmail: string) => Promise<void>;
  changeUserStatsName: (newUserName: string) => Promise<void>;
  unregisterUser: (userEmail: string) => Promise<void>;
}

export const useUserStatsStore = create<UserStatsStore>((set, get) => {
  const {
    getUserStatsSummary,
    getUserStats,
    createUserStats,
    doesUserExist,
    updateUserStats,
    changeUserStatsEmail,
    changeUserStatsName,
    unregisterUser,
  } = getTauriCommands();

  const fetchSummaries = async () => {
    try {
      console.log("Fetching user stats summary");
      set({ loading: true, error: null });
      const summaries = await getUserStatsSummary();

      // Sort alphabetically by userName.
      const sortedSummaries = summaries.sort((a, b) =>
        a.userName.localeCompare(b.userName)
      );

      // A fresh list invalidates any cached per-user detail.
      set({ summaries: sortedSummaries, detailByEmail: {}, loading: false });
    } catch (err) {
      console.warn("Error fetching user stats summary", err);
      set({ error: err as string, loading: false });
    }
  };

  const refresh = async () => {
    await fetchSummaries();
    // Update the addin registry
    const addins = useAddinRegistryStore.getState();
    await addins.refreshRegistry();
  };

  const fetchUserDetail = async (userEmail: string) => {
    const cached = get().detailByEmail[userEmail];
    if (cached) return cached;

    try {
      const detail = await getUserStats(userEmail);
      if (detail) {
        set((state) => ({
          detailByEmail: { ...state.detailByEmail, [userEmail]: detail },
        }));
      }
      return detail;
    } catch (err) {
      console.warn("Error fetching user detail", err);
      set({ error: err as string });
      return undefined;
    }
  };

  const createUserStatsAction = async () => {
    try {
      const newStats = await createUserStats();
      await fetchSummaries();
      return newStats;
    } catch (err) {
      console.warn("Error creating user stats", err);
      set({ error: err as string });
      throw err;
    }
  };

  const updateUserStatsAction = async () => {
    try {
      const updatedStats = await updateUserStats();
      await fetchSummaries();
      return updatedStats;
    } catch (err) {
      console.warn("Error updating user stats", err);
      set({ error: err as string });
      throw err;
    }
  };

  const changeUserStatsEmailAction = async (newUserEmail: string) => {
    try {
      await changeUserStatsEmail(newUserEmail);
      await fetchSummaries();
    } catch (err) {
      console.warn("Error changing user stats email", err);
      set({ error: err as string });
      throw err;
    }
  };

  const changeUserStatsNameAction = async (newUserName: string) => {
    try {
      await changeUserStatsName(newUserName);
      await fetchSummaries();
    } catch (err) {
      console.warn("Error changing user stats name", err);
      set({ error: err as string });
      throw err;
    }
  };

  const unregisterUserAction = async (userEmail: string) => {
    try {
      await unregisterUser(userEmail);
      await fetchSummaries();
    } catch (err) {
      console.warn("Error unregistering user", err);
      set({ error: err as string });
      throw err;
    }
  };

  return {
    // Initial state
    summaries: [],
    detailByEmail: {},
    loading: false,
    error: null,

    // Actions
    fetchSummaries,
    refresh,
    fetchUserDetail,
    doesUserExist,
    createUserStats: createUserStatsAction,
    updateUserStats: updateUserStatsAction,
    changeUserStatsEmail: changeUserStatsEmailAction,
    changeUserStatsName: changeUserStatsNameAction,
    unregisterUser: unregisterUserAction,
  };
});
