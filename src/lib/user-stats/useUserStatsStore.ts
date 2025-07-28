import { create } from "zustand";
import { UserStatsModel } from "../models/user-stats.model";
import getTauriCommands from "../commands/getTauriCommands";

interface UserStatsStore {
  // State
  userStats: UserStatsModel[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchUserStats: () => Promise<void>;
  refresh: () => Promise<void>;
  doesUserExist: (email: string) => Promise<boolean>;
  createUserStats: () => Promise<UserStatsModel>;
  updateUserStats: () => Promise<UserStatsModel | undefined>;
  changeUserStatsEmail: (newUserEmail: string) => Promise<void>;
  changeUserStatsName: (newUserName: string) => Promise<void>;
  unregisterUser: (userEmail: string) => Promise<void>;
}

export const useUserStatsStore = create<UserStatsStore>((set, get) => {
  const {
    getAllUserStats,
    createUserStats,
    doesUserExist,
    updateUserStats,
    changeUserStatsEmail,
    changeUserStatsName,
    unregisterUser,
  } = getTauriCommands();

  const fetchUserStats = async () => {
    try {
      console.log("Fetching user stats");
      set({ loading: true, error: null });
      const stats = await getAllUserStats();
      set({ userStats: stats, loading: false });
      console.log("Got user stats");
    } catch (err) {
      console.warn("Error fetching user stats", err);
      set({ error: err as string, loading: false });
    }
  };

  const refresh = async () => {
    await fetchUserStats();
  };

  const createUserStatsAction = async () => {
    try {
      const newStats = await createUserStats();
      // Refresh the stats after creating new ones
      await fetchUserStats();
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
      // Refresh the stats after updating
      await fetchUserStats();
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
      // Refresh the stats after changing email
      await fetchUserStats();
    } catch (err) {
      console.warn("Error changing user stats email", err);
      set({ error: err as string });
      throw err;
    }
  };

  const changeUserStatsNameAction = async (newUserName: string) => {
    try {
      await changeUserStatsName(newUserName);
      // Refresh the stats after changing name
      await fetchUserStats();
    } catch (err) {
      console.warn("Error changing user stats name", err);
      set({ error: err as string });
      throw err;
    }
  };

  const unregisterUserAction = async (userEmail: string) => {
    try {
      await unregisterUser(userEmail);
      // Refresh the stats after unregistering user
      await fetchUserStats();
    } catch (err) {
      console.warn("Error unregistering user", err);
      set({ error: err as string });
      throw err;
    }
  };

  return {
    // Initial state
    userStats: [],
    loading: false,
    error: null,

    // Actions
    fetchUserStats,
    refresh,
    doesUserExist,
    createUserStats: createUserStatsAction,
    updateUserStats: updateUserStatsAction,
    changeUserStatsEmail: changeUserStatsEmailAction,
    changeUserStatsName: changeUserStatsNameAction,
    unregisterUser: unregisterUserAction,
  };
});
