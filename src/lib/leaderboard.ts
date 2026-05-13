import { leaderboardEntries, type LeaderboardEntry } from "../data/mock";

export type RankedLeaderboardEntry = LeaderboardEntry & {
  rank: number;
  score: number;
  delta: number;
};

function scoreDrift(entry: LeaderboardEntry, seed: number) {
  const wave = Math.sin(seed * 0.0007 + entry.baseScore * 0.013 + entry.faculty.length);
  return Math.round(wave * 36);
}

export function buildLeaderboard(seed = Date.now()): RankedLeaderboardEntry[] {
  return leaderboardEntries
    .map((entry) => {
      const delta = scoreDrift(entry, seed);
      return {
        ...entry,
        delta,
        score: entry.baseScore + delta,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}
