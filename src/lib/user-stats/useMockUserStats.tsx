import { useEffect, useMemo, useState } from "react";
import useLocalAddins from "../local-addins/useLocalAddins";
import {
  generateMockInstalledAddin,
  generateMockPublishedAddin,
  InstalledAddinModel,
  PublishedAddinModel,
  UserStatsModel,
} from "../models/user-stats.model";
import getTauriCommands from "../commands/getTauriCommands";

interface UserStatsState {
  userStats: UserStatsModel[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  doesUserExist: (email: string) => Promise<boolean>;
}

export default function useMockUserStats(): UserStatsState {
  const [userStats, setUserStats] = useState<UserStatsModel[]>(generateMockUserStats());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { doesUserExist } = getTauriCommands();

  const fetchUserStats = async () => {};

  return { userStats, loading, error, refresh: fetchUserStats, doesUserExist };
}

function generateMockUserStats(): UserStatsModel[] {
  let stats: UserStatsModel[] = [];
  for (let j = 0; j < 20; j++) {
    let installedAddins: InstalledAddinModel[] = [];
    let publishedAddins: PublishedAddinModel[] = [];
    for (let i = 0; i < 10; i++) {
      publishedAddins.push(generateMockPublishedAddin());
      installedAddins.push(generateMockInstalledAddin());
    }
    stats.push({
      userEmail: `test${j}@test.com`,
      userName: `Test User ${j}`,
      publishedAddins,
      installedAddins,
      disciplines: ["Mock Discipline"],
    });
  }

  return stats;
}
