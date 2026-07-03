export type EntityId = string;

export type TimestampedEntity = {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = TimestampedEntity & {
  telegramId?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  level: number;
  xp: number;
};

export type QuestStatus = "todo" | "active" | "completed" | "archived";

export type Quest = TimestampedEntity & {
  title: string;
  description?: string;
  status: QuestStatus;
  xpReward: number;
  isDaily: boolean;
  completedAt?: string;
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
