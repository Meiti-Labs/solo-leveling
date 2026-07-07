import { db } from "@/lib/indexed-db/database";
import {
  isAttributeColorScheme,
  isAttributeIconKey,
  isCoreAttributeKey,
  type ActivityEvent,
  type AppNotification,
  type AppDate,
  type AttributeColorScheme,
  type AttributeIconKey,
  type AttributeProgress,
  type AttributeXpGrant,
  type CreateEntity,
  type StoreReward,
  type TaskCompletion,
  type TaskDefinition,
  type UserProfile,
  type UserProgress,
} from "@/lib/indexed-db/types";
import { fromAppDate, getPreviousAppDate, isOffDay, toAppDate } from "./date";
import { getLevelProgress } from "./leveling";
import {
  defaultAchievements,
  defaultAttributes,
  defaultRewards,
  defaultTasks,
  withTimestamps,
} from "./seed-data";

const MAIN_PROGRESS_ID = "progress-main";

type TelegramIdentity = {
  id?: number;
  chatId?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

type CompletionResult = {
  completion: TaskCompletion;
  overallLevelBefore: number;
  overallLevelAfter: number;
  unlockedAchievements: string[];
};

const createId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function normalizeAttributeLabel(label: string) {
  return label.trim().replace(/\s+/g, " ");
}

function slugifyAttributeLabel(label: string) {
  return (
    normalizeAttributeLabel(label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 34) || "attribute"
  );
}

async function findAttributeByLabel(label: string, ignoredId?: string) {
  const normalizedLabel = normalizeAttributeLabel(label).toLowerCase();
  const attributes = await db.attributeProgress.toArray();

  return attributes.find(
    (attribute) =>
      attribute.id !== ignoredId &&
      normalizeAttributeLabel(attribute.label).toLowerCase() === normalizedLabel,
  );
}

async function createUniqueAttributeKey(label: string) {
  const baseKey = `custom-${slugifyAttributeLabel(label)}`;
  let key = baseKey;
  let index = 2;

  while (await db.attributeProgress.where("key").equals(key).first()) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  return key;
}

function normalizeAttributeColorScheme(
  colorScheme?: string,
): AttributeColorScheme {
  return colorScheme && isAttributeColorScheme(colorScheme)
    ? colorScheme
    : "blue";
}

function normalizeAttributeIcon(icon?: string): AttributeIconKey {
  return icon && isAttributeIconKey(icon) ? icon : "sparkles";
}

async function getProfileId(identity?: TelegramIdentity): Promise<string> {
  if (identity?.id) {
    return `profile-${identity.id}`;
  }

  const profiles = await db.profiles.toArray();
  const telegramProfile = profiles.find((profile) => profile.telegramId);

  return telegramProfile?.id ?? profiles[0]?.id ?? "profile-local";
}

function calculateAttributeXp(
  task: TaskDefinition,
  earnedXp: number,
): AttributeXpGrant[] {
  const totalWeight = task.attributes.reduce(
    (total, attribute) => total + attribute.weight,
    0,
  );

  if (!totalWeight) {
    return [];
  }

  return task.attributes.map((attribute) => ({
    key: attribute.key,
    xp: Math.round((earnedXp * attribute.weight) / totalWeight),
  }));
}

async function ensureSeeded<T extends { id: string }>(
  items: T[],
  getItem: (id: string) => Promise<unknown>,
  putItem: (item: T & { createdAt: string; updatedAt: string }) => Promise<unknown>,
) {
  for (const item of items) {
    const existing = await getItem(item.id);

    if (!existing) {
      await putItem(withTimestamps(item));
    }
  }
}

async function syncDefaultTaskBalancing() {
  const timestamp = now();

  for (const defaultTask of defaultTasks) {
    const existingTask = await db.tasks.get(defaultTask.id);

    if (!existingTask?.isDefault) {
      continue;
    }

    const nextValues = {
      coinReward: defaultTask.coinReward,
      gemReward: defaultTask.gemReward,
      missedPenaltyXp: defaultTask.missedPenaltyXp,
      streakBonusEvery: defaultTask.streakBonusEvery,
      streakBonusXp: defaultTask.streakBonusXp,
      xpReward: defaultTask.xpReward,
    };

    const hasChanged =
      existingTask.coinReward !== nextValues.coinReward ||
      existingTask.gemReward !== nextValues.gemReward ||
      existingTask.missedPenaltyXp !== nextValues.missedPenaltyXp ||
      existingTask.streakBonusEvery !== nextValues.streakBonusEvery ||
      existingTask.streakBonusXp !== nextValues.streakBonusXp ||
      existingTask.xpReward !== nextValues.xpReward;

    if (!hasChanged) {
      continue;
    }

    await db.tasks.update(existingTask.id, {
      ...nextValues,
      updatedAt: timestamp,
    });
  }
}

async function getOrCreateProgress(profileId: string): Promise<UserProgress> {
  const existing = await db.userProgress.get(MAIN_PROGRESS_ID);

  if (existing) {
    return existing;
  }

  const timestamp = now();
  const progress: UserProgress = {
    id: MAIN_PROGRESS_ID,
    profileId,
    overallXp: 0,
    coins: 0,
    gems: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyOffDay: 5,
    yearStartedOn: toAppDate(),
    lostXpCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await db.userProgress.put(progress);
  return progress;
}

async function addActivity(
  input: Omit<ActivityEvent, "id" | "createdAt" | "updatedAt">,
) {
  const timestamp = now();
  await db.activityEvents.add({
    ...input,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function addNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "updatedAt">,
) {
  const timestamp = now();
  await db.notifications.add({
    ...input,
    id: createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function addWalletTransaction(input: {
  currency: "coins" | "gems";
  amount: number;
  reason: string;
  sourceType: "task-completion" | "achievement" | "manual-adjustment";
  sourceId?: string;
}) {
  const timestamp = now();
  await db.walletTransactions.add({
    ...input,
    id: createId(),
    occurredAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

async function addXpToAttributes(attributeXp: AttributeXpGrant[]) {
  for (const grant of attributeXp) {
    const progress = await db.attributeProgress
      .where("key")
      .equals(grant.key)
      .first();

    if (!progress) {
      continue;
    }

    await db.attributeProgress.update(progress.id, {
      xp: Math.max(0, progress.xp + grant.xp),
      updatedAt: now(),
    });
  }
}

async function getTaskCompletion(
  taskId: string,
  completedForDate?: AppDate,
): Promise<TaskCompletion | undefined> {
  const completions = await db.taskCompletions
    .where("taskId")
    .equals(taskId)
    .toArray();

  return completedForDate
    ? completions.find(
        (completion) => completion.completedForDate === completedForDate,
      )
    : completions[0];
}

async function evaluateAchievements(
  progress: UserProgress,
): Promise<string[]> {
  const definitions = await db.achievementDefinitions.toArray();
  const unlocks = await db.achievementUnlocks.toArray();
  const unlockedKeys = new Set(unlocks.map((unlock) => unlock.achievementKey));
  const completions = await db.taskCompletions.toArray();
  const transactions = await db.walletTransactions.toArray();
  const overallLevel = getLevelProgress(progress.overallXp).level;
  const bossesCompleted = completions.filter(
    (completion) => completion.taskKind === "boss",
  ).length;
  const coinsEarned = transactions
    .filter(
      (transaction) => transaction.currency === "coins" && transaction.amount > 0,
    )
    .reduce((total, transaction) => total + transaction.amount, 0);
  const metrics = {
    "overall-level": overallLevel,
    "bosses-completed": bossesCompleted,
    "current-streak": progress.currentStreak,
    "tasks-completed": completions.length,
    "coins-earned": coinsEarned,
    "no-xp-loss-year": progress.lostXpCount === 0 ? overallLevel : 0,
  } as const;
  const newlyUnlocked: string[] = [];

  for (const definition of definitions) {
    if (unlockedKeys.has(definition.key)) {
      continue;
    }

    if (metrics[definition.metric] < definition.target) {
      continue;
    }

    const timestamp = now();
    await db.achievementUnlocks.add({
      id: createId(),
      achievementKey: definition.key,
      unlockedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const updatedProgress = await db.userProgress.get(MAIN_PROGRESS_ID);

    if (updatedProgress) {
      await db.userProgress.update(MAIN_PROGRESS_ID, {
        coins: updatedProgress.coins + definition.coinReward,
        gems: updatedProgress.gems + definition.gemReward,
        updatedAt: timestamp,
      });
    }

    if (definition.coinReward > 0) {
      await addWalletTransaction({
        currency: "coins",
        amount: definition.coinReward,
        reason: `Achievement unlocked: ${definition.title}`,
        sourceType: "achievement",
        sourceId: definition.id,
      });
    }

    if (definition.gemReward > 0) {
      await addWalletTransaction({
        currency: "gems",
        amount: definition.gemReward,
        reason: `Achievement unlocked: ${definition.title}`,
        sourceType: "achievement",
        sourceId: definition.id,
      });
    }

    await addActivity({
      type: "achievement-unlocked",
      title: "Achievement Unlocked",
      description: definition.title,
      occurredAt: timestamp,
      coinDelta: definition.coinReward,
      gemDelta: definition.gemReward,
      metadata: { achievementKey: definition.key },
    });
    await addNotification({
      type:
        definition.category === "achievement" ? "achievement" : "badge",
      title:
        definition.category === "achievement"
          ? "Achievement Unlocked"
          : "Badge Earned",
      description: definition.title,
      occurredAt: timestamp,
      metadata: {
        achievementKey: definition.key,
        category: definition.category,
        medalImage: definition.medalImage,
      },
    });

    newlyUnlocked.push(definition.key);
  }

  return newlyUnlocked;
}

async function recordLevelUpIfNeeded(
  beforeLevel: number,
  afterLevel: number,
) {
  if (afterLevel <= beforeLevel) {
    return;
  }

  const timestamp = now();

  for (let level = beforeLevel + 1; level <= afterLevel; level += 1) {
    await addActivity({
      type: "level-up",
      title: "Level Up!",
      description: `You reached Level ${level}`,
      occurredAt: timestamp,
      metadata: { beforeLevel, afterLevel, level },
    });
    await addNotification({
      type: "level-up",
      title: "Level Up!",
      description: `You reached Level ${level}`,
      occurredAt: timestamp,
      metadata: { beforeLevel, afterLevel, level },
    });
  }
}

export const gameService = {
  async initialize(identity?: TelegramIdentity) {
    const timestamp = now();
    const profileId = await getProfileId(identity);
    const existingProfile = await db.profiles.get(profileId);
    const profile: UserProfile = {
      id: profileId,
      telegramId: identity?.id ?? existingProfile?.telegramId,
      chatId: identity?.chatId ?? existingProfile?.chatId,
      firstName: identity?.first_name ?? existingProfile?.firstName,
      lastName: identity?.last_name ?? existingProfile?.lastName,
      username: identity?.username ?? existingProfile?.username,
      photoUrl: identity?.photo_url ?? existingProfile?.photoUrl,
      languageCode: identity?.language_code ?? existingProfile?.languageCode,
      createdAt: existingProfile?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await db.profiles.put(profile);
    await getOrCreateProgress(profile.id);
    await ensureSeeded(
      defaultAttributes,
      (id) => db.attributeProgress.get(id),
      (item) => db.attributeProgress.put(item),
    );
    await ensureSeeded(
      defaultTasks,
      (id) => db.tasks.get(id),
      (item) => db.tasks.put(item),
    );
    await syncDefaultTaskBalancing();
    await ensureSeeded(
      defaultRewards,
      (id) => db.rewards.get(id),
      (item) => db.rewards.put(item),
    );
    await ensureSeeded(
      defaultAchievements,
      (id) => db.achievementDefinitions.get(id),
      (item) => db.achievementDefinitions.put(item),
    );

    return this.getSnapshot();
  },

  async getSnapshot() {
    const progress = await getOrCreateProgress(await getProfileId());
    const profile = await db.profiles.get(progress.profileId);
    const attributes = await db.attributeProgress.toArray();
    const tasks = await db.tasks.toArray();
    const taskCompletions = await db.taskCompletions.toArray();
    const rewards = await db.rewards.toArray();
    const rewardPurchases = await db.rewardPurchases.toArray();
    const walletTransactions = await db.walletTransactions.toArray();
    const achievements = await db.achievementDefinitions.toArray();
    const achievementUnlocks = await db.achievementUnlocks.toArray();
    const activityEvents = await db.activityEvents
      .orderBy("occurredAt")
      .reverse()
      .toArray();
    const notifications = await db.notifications
      .orderBy("occurredAt")
      .reverse()
      .toArray();

    return {
      profile,
      progress,
      overallLevel: getLevelProgress(progress.overallXp),
      attributes: attributes.map((attribute) => ({
        ...attribute,
        level: getLevelProgress(attribute.xp),
      })),
      tasks,
      taskCompletions,
      rewards,
      rewardPurchases,
      walletTransactions,
      achievements,
      achievementUnlocks,
      activityEvents,
      notifications,
    };
  },

  async createTask(input: CreateEntity<TaskDefinition>): Promise<TaskDefinition> {
    const timestamp = now();
    const task: TaskDefinition = {
      ...input,
      id: input.id ?? createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.tasks.add(task);
    return task;
  },

  async createAttribute(input: {
    colorScheme?: string;
    icon?: string;
    label: string;
  }): Promise<AttributeProgress> {
    await this.initialize();

    const label = normalizeAttributeLabel(input.label);

    if (!label) {
      throw new Error("Attribute name is required.");
    }

    if (await findAttributeByLabel(label)) {
      throw new Error("An attribute with this name already exists.");
    }

    const timestamp = now();
    const attribute: AttributeProgress = {
      id: createId(),
      key: await createUniqueAttributeKey(label),
      label,
      xp: 0,
      isDefault: false,
      colorScheme: normalizeAttributeColorScheme(input.colorScheme),
      icon: normalizeAttributeIcon(input.icon),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.attributeProgress.add(attribute);
    return attribute;
  },

  async updateAttribute(
    attributeId: string,
    input: { colorScheme?: string; icon?: string; label: string },
  ): Promise<AttributeProgress> {
    await this.initialize();

    const attribute = await db.attributeProgress.get(attributeId);

    if (!attribute) {
      throw new Error(`Attribute was not found: ${attributeId}`);
    }

    if (attribute.isDefault || isCoreAttributeKey(attribute.key)) {
      throw new Error("Default attributes cannot be renamed.");
    }

    const label = normalizeAttributeLabel(input.label);

    if (!label) {
      throw new Error("Attribute name is required.");
    }

    if (await findAttributeByLabel(label, attribute.id)) {
      throw new Error("An attribute with this name already exists.");
    }

    const timestamp = now();
    const colorScheme = normalizeAttributeColorScheme(
      input.colorScheme ?? attribute.colorScheme,
    );
    const icon = normalizeAttributeIcon(input.icon ?? attribute.icon);

    await db.attributeProgress.update(attribute.id, {
      colorScheme,
      icon,
      label,
      updatedAt: timestamp,
    });

    return {
      ...attribute,
      colorScheme,
      icon,
      label,
      updatedAt: timestamp,
    };
  },

  async archiveTask(taskId: string): Promise<void> {
    await this.initialize();
    const task = await db.tasks.get(taskId);

    if (!task) {
      throw new Error(`Task was not found: ${taskId}`);
    }

    await db.tasks.update(task.id, {
      status: "archived",
      updatedAt: now(),
    });
  },

  async completeTask(
    taskId: string,
    completedForDate = toAppDate(),
  ): Promise<CompletionResult> {
    const snapshot = await this.initialize();
    const task = await db.tasks.get(taskId);

    if (!task || task.status !== "active") {
      throw new Error(`Task is not active: ${taskId}`);
    }

    const existingCompletion =
      task.kind === "daily"
        ? await getTaskCompletion(task.id, completedForDate)
        : await getTaskCompletion(task.id);

    if (existingCompletion) {
      return {
        completion: existingCompletion,
        overallLevelBefore: snapshot.overallLevel.level,
        overallLevelAfter: snapshot.overallLevel.level,
        unlockedAchievements: [],
      };
    }

    const progress = snapshot.progress;
    const overallLevelBefore = getLevelProgress(progress.overallXp).level;
    const offDayMultiplier = isOffDay(completedForDate, progress.weeklyOffDay)
      ? 2
      : 1;
    let nextStreak = progress.currentStreak;
    let streakBonusXp = 0;
    let dailyStreakWillBeSecured = false;

    if (task.kind === "daily") {
      const activeDailyTasks = await db.tasks
        .where("kind")
        .equals("daily")
        .filter((candidate) => candidate.status === "active")
        .toArray();
      const todaysDailyCompletions = await db.taskCompletions
        .where("completedForDate")
        .equals(completedForDate)
        .filter((completion) => completion.taskKind === "daily")
        .toArray();
      const completedDailyTaskIds = new Set(
        todaysDailyCompletions.map((completion) => completion.taskId),
      );

      completedDailyTaskIds.add(task.id);
      dailyStreakWillBeSecured =
        activeDailyTasks.length > 0 &&
        activeDailyTasks.every((candidate) =>
          completedDailyTaskIds.has(candidate.id),
        );
    }

    if (
      task.kind === "daily" &&
      dailyStreakWillBeSecured &&
      progress.lastCompletedDate !== completedForDate
    ) {
      const lastDate = progress.lastCompletedDate
        ? fromAppDate(progress.lastCompletedDate)
        : undefined;
      const currentDate = fromAppDate(completedForDate);
      const dayGap = lastDate
        ? Math.round(
            (currentDate.getTime() - lastDate.getTime()) / 86_400_000,
          )
        : 1;

      nextStreak = dayGap <= 1 ? progress.currentStreak + 1 : 1;

      if (
        task.streakBonusEvery &&
        task.streakBonusXp &&
        nextStreak > 0 &&
        nextStreak % task.streakBonusEvery === 0
      ) {
        streakBonusXp = task.streakBonusXp;
      }
    }

    const earnedXp = Math.round(
      (task.xpReward + streakBonusXp) * offDayMultiplier,
    );
    const earnedCoins = Math.round(task.coinReward * offDayMultiplier);
    const earnedGems = Math.round(task.gemReward * offDayMultiplier);
    const attributeXp = calculateAttributeXp(task, earnedXp);
    const timestamp = now();
    const completion: TaskCompletion = {
      id: createId(),
      taskId: task.id,
      taskKind: task.kind,
      completedForDate,
      completedAt: timestamp,
      earnedXp,
      earnedCoins,
      earnedGems,
      attributeXp,
      streakAfter:
        task.kind === "daily"
          ? dailyStreakWillBeSecured
            ? nextStreak
            : progress.currentStreak
          : undefined,
      offDayMultiplier,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.taskCompletions.add(completion);
    await addXpToAttributes(attributeXp);

    if (task.kind !== "daily") {
      await db.tasks.update(task.id, {
        status: "completed",
        updatedAt: timestamp,
      });
    }

    await db.userProgress.update(progress.id, {
      overallXp: progress.overallXp + earnedXp,
      coins: progress.coins + earnedCoins,
      gems: progress.gems + earnedGems,
      currentStreak: nextStreak,
      longestStreak: Math.max(progress.longestStreak, nextStreak),
      lastCompletedDate:
        task.kind === "daily" && dailyStreakWillBeSecured
          ? completedForDate
          : progress.lastCompletedDate,
      updatedAt: timestamp,
    });

    if (earnedCoins > 0) {
      await addWalletTransaction({
        currency: "coins",
        amount: earnedCoins,
        reason: `Task completed: ${task.title}`,
        sourceType: "task-completion",
        sourceId: completion.id,
      });
    }

    if (earnedGems > 0) {
      await addWalletTransaction({
        currency: "gems",
        amount: earnedGems,
        reason: `Task completed: ${task.title}`,
        sourceType: "task-completion",
        sourceId: completion.id,
      });
    }

    await addActivity({
      type: "task-completed",
      title: task.kind === "boss" ? "Boss Quest Completed" : "Quest Completed",
      description: task.title,
      occurredAt: timestamp,
      xpDelta: earnedXp,
      coinDelta: earnedCoins,
      gemDelta: earnedGems,
      metadata: { taskId: task.id, completedForDate },
    });

    if (task.kind === "boss") {
      await addNotification({
        type: "boss",
        title: "Boss Defeated",
        description: task.title,
        occurredAt: timestamp,
        metadata: {
          completionId: completion.id,
          earnedXp,
          taskId: task.id,
        },
      });
    }

    const updatedProgress = await db.userProgress.get(progress.id);
    const overallLevelAfter = getLevelProgress(
      updatedProgress?.overallXp ?? progress.overallXp + earnedXp,
    ).level;

    await recordLevelUpIfNeeded(overallLevelBefore, overallLevelAfter);

    const unlockedAchievements = updatedProgress
      ? await evaluateAchievements(updatedProgress)
      : [];

    return {
      completion,
      overallLevelBefore,
      overallLevelAfter,
      unlockedAchievements,
    };
  },

  async applyMissedDailyPenalties(date = getPreviousAppDate()) {
    await this.initialize();
    const progress = await db.userProgress.get(MAIN_PROGRESS_ID);

    if (!progress || isOffDay(date, progress.weeklyOffDay)) {
      return { date, missedTasks: [], penaltyXp: 0, skipped: true };
    }

    const existingPenalty = await db.activityEvents
      .where("type")
      .equals("daily-missed")
      .filter((event) => event.metadata?.date === date)
      .first();

    if (existingPenalty) {
      return { date, missedTasks: [], penaltyXp: 0, skipped: true };
    }

    const dailyTasks = await db.tasks
      .where("kind")
      .equals("daily")
      .filter((task) => task.status === "active")
      .toArray();
    const missedTasks: TaskDefinition[] = [];

    for (const task of dailyTasks) {
      const completion = await getTaskCompletion(task.id, date);

      if (!completion) {
        missedTasks.push(task);
      }
    }

    const penaltyXp = missedTasks.reduce(
      (total, task) => total + task.missedPenaltyXp,
      0,
    );

    if (!penaltyXp) {
      return { date, missedTasks: [], penaltyXp: 0, skipped: false };
    }

    const timestamp = now();
    await db.userProgress.update(progress.id, {
      overallXp: Math.max(0, progress.overallXp - penaltyXp),
      currentStreak: 0,
      lostXpCount: progress.lostXpCount + penaltyXp,
      updatedAt: timestamp,
    });

    await addActivity({
      type: "daily-missed",
      title: "Daily Streak Broken",
      description: `${missedTasks.length} task${
        missedTasks.length === 1 ? "" : "s"
      } missed`,
      occurredAt: timestamp,
      xpDelta: -penaltyXp,
      metadata: { date, taskIds: missedTasks.map((task) => task.id) },
    });

    return { date, missedTasks, penaltyXp, skipped: false };
  },

  async evaluateBossDeadlines(today = toAppDate()) {
    await this.initialize();
    const progress = await db.userProgress.get(MAIN_PROGRESS_ID);

    if (!progress) {
      return { failedBosses: [], penaltyXp: 0 };
    }

    const bosses = await db.tasks
      .where("kind")
      .equals("boss")
      .filter(
        (task) =>
          task.status === "active" &&
          Boolean(task.deadline) &&
          task.deadline! < today,
      )
      .toArray();
    const failedBosses: TaskDefinition[] = [];

    for (const boss of bosses) {
      const completion = await getTaskCompletion(boss.id);

      if (!completion) {
        failedBosses.push(boss);
      }
    }

    const penaltyXp = failedBosses.reduce(
      (total, boss) => total + boss.missedPenaltyXp,
      0,
    );

    if (!penaltyXp) {
      return { failedBosses, penaltyXp: 0 };
    }

    const timestamp = now();

    for (const boss of failedBosses) {
      await db.tasks.update(boss.id, {
        status: "failed",
        updatedAt: timestamp,
      });
    }

    await db.userProgress.update(progress.id, {
      overallXp: Math.max(0, progress.overallXp - penaltyXp),
      lostXpCount: progress.lostXpCount + penaltyXp,
      updatedAt: timestamp,
    });

    await addActivity({
      type: "boss-failed",
      title: "Boss Deadline Missed",
      description: `${failedBosses.length} boss quest${
        failedBosses.length === 1 ? "" : "s"
      } failed`,
      occurredAt: timestamp,
      xpDelta: -penaltyXp,
      metadata: { bossIds: failedBosses.map((boss) => boss.id) },
    });

    return { failedBosses, penaltyXp };
  },

  async listActiveTasks() {
    await this.initialize();
    return db.tasks.where("status").equals("active").toArray();
  },

  async listAttributes(): Promise<AttributeProgress[]> {
    await this.initialize();
    return db.attributeProgress.toArray();
  },

  async listRewards(): Promise<StoreReward[]> {
    await this.initialize();
    return db.rewards.filter((reward) => !reward.isArchived).toArray();
  },

  async updateWeeklyOffDay(weeklyOffDay: number) {
    await this.initialize();

    if (!Number.isInteger(weeklyOffDay) || weeklyOffDay < 0 || weeklyOffDay > 6) {
      throw new Error("Weekly off day should be a day between Sunday and Saturday.");
    }

    const timestamp = now();

    await db.userProgress.update(MAIN_PROGRESS_ID, {
      weeklyOffDay,
      updatedAt: timestamp,
    });
    await db.settings.put({
      key: "weeklyOffDay",
      value: weeklyOffDay,
      updatedAt: timestamp,
    });

    return this.getSnapshot();
  },

  async exportLocalData() {
    await this.initialize();

    return {
      app: "solo-leveling-mini",
      exportedAt: now(),
      schemaVersion: 3,
      tables: {
        profiles: await db.profiles.toArray(),
        userProgress: await db.userProgress.toArray(),
        attributeProgress: await db.attributeProgress.toArray(),
        tasks: await db.tasks.toArray(),
        taskCompletions: await db.taskCompletions.toArray(),
        rewards: await db.rewards.toArray(),
        rewardPurchases: await db.rewardPurchases.toArray(),
        walletTransactions: await db.walletTransactions.toArray(),
        achievementDefinitions: await db.achievementDefinitions.toArray(),
        achievementUnlocks: await db.achievementUnlocks.toArray(),
        activityEvents: await db.activityEvents.toArray(),
        notifications: await db.notifications.toArray(),
        settings: await db.settings.toArray(),
      },
    };
  },

  async resetLocalGameData() {
    await db.userProgress.clear();
    await db.attributeProgress.clear();
    await db.tasks.clear();
    await db.taskCompletions.clear();
    await db.rewards.clear();
    await db.rewardPurchases.clear();
    await db.walletTransactions.clear();
    await db.achievementDefinitions.clear();
    await db.achievementUnlocks.clear();
    await db.activityEvents.clear();
    await db.notifications.clear();
    await db.settings.clear();

    return this.initialize();
  },
};
