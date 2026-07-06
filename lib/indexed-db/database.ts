import Dexie, { type Table } from "dexie";
import type {
  AchievementDefinition,
  AchievementUnlock,
  ActivityEvent,
  AppNotification,
  AppSetting,
  AttributeProgress,
  RewardPurchase,
  StoreReward,
  TaskCompletion,
  TaskDefinition,
  UserProfile,
  UserProgress,
  WalletTransaction,
} from "./types";

class SoloLevelingDatabase extends Dexie {
  profiles!: Table<UserProfile, string>;
  userProgress!: Table<UserProgress, string>;
  attributeProgress!: Table<AttributeProgress, string>;
  tasks!: Table<TaskDefinition, string>;
  taskCompletions!: Table<TaskCompletion, string>;
  rewards!: Table<StoreReward, string>;
  rewardPurchases!: Table<RewardPurchase, string>;
  walletTransactions!: Table<WalletTransaction, string>;
  achievementDefinitions!: Table<AchievementDefinition, string>;
  achievementUnlocks!: Table<AchievementUnlock, string>;
  activityEvents!: Table<ActivityEvent, string>;
  notifications!: Table<AppNotification, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super("solo-leveling-mini");

    this.version(1).stores({
      profiles: "id, telegramId, username, updatedAt",
      quests: "id, status, isDaily, completedAt, updatedAt",
      settings: "key, updatedAt",
    });

    this.version(2).stores({
      profiles: "id, telegramId, chatId, username, updatedAt",
      userProgress: "id, profileId, yearStartedOn, updatedAt",
      attributeProgress: "id, key, updatedAt",
      tasks: "id, kind, status, difficulty, deadline, isDefault, updatedAt",
      taskCompletions:
        "id, taskId, taskKind, completedForDate, completedAt, updatedAt",
      rewards: "id, kind, currency, isDefault, isArchived, updatedAt",
      rewardPurchases: "id, rewardId, currency, purchasedAt, updatedAt",
      walletTransactions:
        "id, currency, sourceType, sourceId, occurredAt, updatedAt",
      achievementDefinitions:
        "id, key, category, metric, target, isDefault, updatedAt",
      achievementUnlocks: "id, achievementKey, unlockedAt, updatedAt",
      activityEvents: "id, type, occurredAt, updatedAt",
      settings: "key, updatedAt",
    });

    this.version(3).stores({
      profiles: "id, telegramId, chatId, username, updatedAt",
      userProgress: "id, profileId, yearStartedOn, updatedAt",
      attributeProgress: "id, key, updatedAt",
      tasks: "id, kind, status, difficulty, deadline, isDefault, updatedAt",
      taskCompletions:
        "id, taskId, taskKind, completedForDate, completedAt, updatedAt",
      rewards: "id, kind, currency, isDefault, isArchived, updatedAt",
      rewardPurchases: "id, rewardId, currency, purchasedAt, updatedAt",
      walletTransactions:
        "id, currency, sourceType, sourceId, occurredAt, updatedAt",
      achievementDefinitions:
        "id, key, category, metric, target, isDefault, updatedAt",
      achievementUnlocks: "id, achievementKey, unlockedAt, updatedAt",
      activityEvents: "id, type, occurredAt, updatedAt",
      notifications: "id, type, occurredAt, readAt, updatedAt",
      settings: "key, updatedAt",
    });
  }
}

export const db = new SoloLevelingDatabase();
