export type EntityId = string;
export type AppDate = string;

export type TimestampedEntity = {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
};

export const ATTRIBUTE_KEYS = [
  "strength",
  "intelligence",
  "discipline",
  "finance",
  "wisdom",
  "communication",
] as const;

export const ATTRIBUTE_COLOR_SCHEMES = [
  "purple",
  "blue",
  "green",
  "gold",
  "cyan",
  "pink",
  "red",
  "indigo",
] as const;

export const ATTRIBUTE_ICON_KEYS = [
  "activity",
  "alarm-clock",
  "award",
  "bike",
  "book-open",
  "brain",
  "briefcase",
  "calendar-check",
  "camera",
  "code-2",
  "coffee",
  "coins",
  "compass",
  "crown",
  "dumbbell",
  "flame",
  "gamepad-2",
  "gem",
  "graduation-cap",
  "handshake",
  "heart",
  "heart-pulse",
  "leaf",
  "medal",
  "message-square",
  "moon",
  "mountain",
  "music",
  "palette",
  "pencil",
  "rocket",
  "shield",
  "smile",
  "sparkles",
  "star",
  "sun",
  "sword",
  "target",
  "trophy",
  "zap",
] as const;

export type CoreAttributeKey = (typeof ATTRIBUTE_KEYS)[number];
export type AttributeKey = CoreAttributeKey | (string & Record<never, never>);
export type AttributeColorScheme = (typeof ATTRIBUTE_COLOR_SCHEMES)[number];
export type AttributeIconKey = (typeof ATTRIBUTE_ICON_KEYS)[number];

export function isCoreAttributeKey(value: string): value is CoreAttributeKey {
  return (ATTRIBUTE_KEYS as readonly string[]).includes(value);
}

export function isAttributeColorScheme(
  value: string,
): value is AttributeColorScheme {
  return (ATTRIBUTE_COLOR_SCHEMES as readonly string[]).includes(value);
}

export function isAttributeIconKey(value: string): value is AttributeIconKey {
  return (ATTRIBUTE_ICON_KEYS as readonly string[]).includes(value);
}

export type UserProfile = TimestampedEntity & {
  telegramId?: number;
  chatId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
};

export type UserProgress = TimestampedEntity & {
  profileId: EntityId;
  overallXp: number;
  coins: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: AppDate;
  weeklyOffDay: number;
  yearStartedOn: AppDate;
  lostXpCount: number;
};

export type AttributeProgress = TimestampedEntity & {
  key: AttributeKey;
  label: string;
  xp: number;
  isDefault?: boolean;
  colorScheme?: AttributeColorScheme;
  icon?: AttributeIconKey;
};

export type TaskKind = "daily" | "goal" | "boss";
export type TaskStatus = "active" | "completed" | "failed" | "archived";
export type TaskDifficulty = "easy" | "medium" | "hard" | "boss";

export type TaskAttributeWeight = {
  key: AttributeKey;
  weight: number;
};

export type TaskDefinition = TimestampedEntity & {
  title: string;
  description?: string;
  kind: TaskKind;
  status: TaskStatus;
  difficulty: TaskDifficulty;
  attributes: TaskAttributeWeight[];
  xpReward: number;
  coinReward: number;
  gemReward: number;
  deadline?: AppDate;
  missedPenaltyXp: number;
  streakBonusEvery?: number;
  streakBonusXp?: number;
  isDefault: boolean;
};

export type AttributeXpGrant = {
  key: AttributeKey;
  xp: number;
};

export type TaskCompletion = TimestampedEntity & {
  taskId: EntityId;
  taskKind: TaskKind;
  completedForDate: AppDate;
  completedAt: string;
  earnedXp: number;
  earnedCoins: number;
  earnedGems: number;
  attributeXp: AttributeXpGrant[];
  streakAfter?: number;
  offDayMultiplier: number;
};

export type Currency = "coins" | "gems";
export type RewardKind = "physical" | "experience" | "digital" | "custom";

export type StoreReward = TimestampedEntity & {
  title: string;
  description?: string;
  kind: RewardKind;
  cost: number;
  currency: Currency;
  isDefault: boolean;
  isArchived: boolean;
};

export type RewardPurchase = TimestampedEntity & {
  rewardId: EntityId;
  title: string;
  cost: number;
  currency: Currency;
  purchasedAt: string;
  redeemedAt?: string;
};

export type WalletTransaction = TimestampedEntity & {
  currency: Currency;
  amount: number;
  reason: string;
  sourceType:
    | "task-completion"
    | "reward-purchase"
    | "achievement"
    | "manual-adjustment";
  sourceId?: EntityId;
  occurredAt: string;
};

export type AchievementMetric =
  | "overall-level"
  | "bosses-completed"
  | "current-streak"
  | "tasks-completed"
  | "coins-earned"
  | "no-xp-loss-year";

export type AchievementCategory =
  | "medal"
  | "achievement"
  | "boss-trophy"
  | "title";

export type AchievementDefinition = TimestampedEntity & {
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  target: number;
  medalImage?: string;
  coinReward: number;
  gemReward: number;
  isDefault: boolean;
};

export type AchievementUnlock = TimestampedEntity & {
  achievementKey: string;
  unlockedAt: string;
};

export type ActivityEvent = TimestampedEntity & {
  type:
    | "task-completed"
    | "daily-missed"
    | "boss-failed"
    | "reward-purchased"
    | "reward-redeemed"
    | "achievement-unlocked"
    | "level-up";
  title: string;
  description?: string;
  occurredAt: string;
  xpDelta?: number;
  coinDelta?: number;
  gemDelta?: number;
  metadata?: Record<string, unknown>;
};

export type NotificationType =
  | "achievement"
  | "badge"
  | "boss"
  | "level-up";

export type AppNotification = TimestampedEntity & {
  type: NotificationType;
  title: string;
  description?: string;
  occurredAt: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
};

export type AppSetting<TValue = unknown> = {
  key: string;
  value: TValue;
  updatedAt: string;
};

export type CreateEntity<T extends TimestampedEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: EntityId;
};

export type UpdateEntity<T extends TimestampedEntity> = Partial<
  Omit<T, "id" | "createdAt">
>;
