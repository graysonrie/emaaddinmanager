import { useEffect, useMemo, useState } from "react";
import useLocalAddins from "../local-addins/useLocalAddins";
import { UserStatsModel } from "../models/user-stats.model";
import getTauriCommands from "../commands/getTauriCommands";

interface UserStatsState {
  userStats: UserStatsModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  doesUserExist: (email: string) => Promise<boolean>;
}

export default function useUserStats(): UserStatsState {
  const [userStats, setUserStats] = useState<UserStatsModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getAllUserStats, createUserStats, doesUserExist } =
    getTauriCommands();

  const fetchUserStats = async () => {
    try {
      const stats = await getAllUserStats();
      setUserStats(stats);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const createUserStatsIfNotExists = async () => {
      setLoading(true);
      // Ensure that the user does exist when we try to fetch the user stats
      // This command can be expected to fail if the user already exists
      try {
        await createUserStats();
      } catch (error) {
        console.warn("Failed to create user stats", error);
      }
      fetchUserStats();
    };
    createUserStatsIfNotExists();
  }, []);

  return { userStats, loading, error, refresh: fetchUserStats, doesUserExist };
}
