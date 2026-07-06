import { db } from "@/lib/indexed-db/database";
import { ATTRIBUTE_KEYS } from "@/lib/indexed-db/types";
import { gameService } from "./game-service";
import { getLevelProgress } from "./leveling";

export const analyticsService = {
  async getOverview() {
    await gameService.initialize();

    const progress = await db.userProgress.get("progress-main");
    const completions = await db.taskCompletions.toArray();
    const activities = await db.activityEvents
      .orderBy("occurredAt")
      .reverse()
      .limit(20)
      .toArray();
    const attributes = await db.attributeProgress.toArray();
    const rewardPurchases = await db.rewardPurchases.toArray();
    const taskMap = new Map(
      (await db.tasks.toArray()).map((task) => [task.id, task]),
    );
    const bossesCompleted = completions.filter(
      (completion) => completion.taskKind === "boss",
    ).length;
    const tasksCompleted = completions.length;
    const attributeLevels = ATTRIBUTE_KEYS.map((key) => {
      const attribute = attributes.find((item) => item.key === key);

      return {
        key,
        label: attribute?.label ?? key,
        xp: attribute?.xp ?? 0,
        level: getLevelProgress(attribute?.xp ?? 0),
      };
    });
    const xpByDate = completions.reduce<Record<string, number>>(
      (dates, completion) => {
        dates[completion.completedForDate] =
          (dates[completion.completedForDate] ?? 0) + completion.earnedXp;
        return dates;
      },
      {},
    );

    return {
      progress,
      overallLevel: getLevelProgress(progress?.overallXp ?? 0),
      tasksCompleted,
      bossesCompleted,
      rewardPurchases,
      activities,
      attributeLevels,
      xpByDate,
      activeTasks: [...taskMap.values()].filter(
        (task) => task.status === "active",
      ),
    };
  },
};
