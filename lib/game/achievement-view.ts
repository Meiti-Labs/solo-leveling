import type { gameService } from "@/lib/game/game-service";
import type {
  AchievementDefinition,
  AchievementMetric,
  AchievementUnlock,
} from "@/lib/indexed-db/types";

type GameSnapshot = Awaited<ReturnType<typeof gameService.getSnapshot>>;

export type AchievementView = AchievementDefinition & {
  currentValue: number;
  isUnlocked: boolean;
  progressPercent: number;
  unlockedAt?: string;
};

export function buildAchievementViews(
  snapshot: GameSnapshot,
): AchievementView[] {
  const unlockMap = new Map(
    snapshot.achievementUnlocks.map((unlock) => [
      unlock.achievementKey,
      unlock,
    ]),
  );

  return snapshot.achievements
    .map((achievement) =>
      buildAchievementView(
        achievement,
        unlockMap.get(achievement.key),
        getMetricValue(achievement.metric, snapshot),
      ),
    )
    .sort((first, second) => {
      if (first.isUnlocked !== second.isUnlocked) {
        return first.isUnlocked ? -1 : 1;
      }

      if (first.isUnlocked && second.isUnlocked) {
        return (second.unlockedAt ?? "").localeCompare(first.unlockedAt ?? "");
      }

      return second.progressPercent - first.progressPercent;
    });
}

function buildAchievementView(
  achievement: AchievementDefinition,
  unlock: AchievementUnlock | undefined,
  currentValue: number,
): AchievementView {
  const isUnlocked = Boolean(unlock);

  return {
    ...achievement,
    currentValue,
    isUnlocked,
    progressPercent: isUnlocked
      ? 100
      : Math.min(100, Math.round((currentValue / achievement.target) * 100)),
    unlockedAt: unlock?.unlockedAt,
  };
}

function getMetricValue(
  metric: AchievementMetric,
  snapshot: GameSnapshot,
): number {
  if (metric === "overall-level") {
    return snapshot.overallLevel.level;
  }

  if (metric === "bosses-completed") {
    return snapshot.taskCompletions.filter(
      (completion) => completion.taskKind === "boss",
    ).length;
  }

  if (metric === "current-streak") {
    return snapshot.progress.currentStreak;
  }

  if (metric === "tasks-completed") {
    return snapshot.taskCompletions.length;
  }

  if (metric === "coins-earned") {
    return snapshot.walletTransactions
      .filter(
        (transaction) =>
          transaction.currency === "coins" && transaction.amount > 0,
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  if (metric === "no-xp-loss-year") {
    return snapshot.progress.lostXpCount === 0 ? snapshot.overallLevel.level : 0;
  }

  return 0;
}
