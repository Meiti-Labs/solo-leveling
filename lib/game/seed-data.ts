import type {
  AchievementDefinition,
  AttributeProgress,
  StoreReward,
  TaskDefinition,
} from "@/lib/indexed-db/types";

const now = () => new Date().toISOString();

export const defaultAttributes: Array<
  Pick<AttributeProgress, "id" | "key" | "label" | "xp">
> = [
  { id: "attribute-strength", key: "strength", label: "Strength", xp: 0 },
  {
    id: "attribute-intelligence",
    key: "intelligence",
    label: "Intelligence",
    xp: 0,
  },
  { id: "attribute-discipline", key: "discipline", label: "Discipline", xp: 0 },
  { id: "attribute-finance", key: "finance", label: "Finance", xp: 0 },
  { id: "attribute-wisdom", key: "wisdom", label: "Wisdom", xp: 0 },
  {
    id: "attribute-communication",
    key: "communication",
    label: "Communication",
    xp: 0,
  },
];

export const defaultTasks: Array<
  Omit<TaskDefinition, "createdAt" | "updatedAt">
> = [
  {
    id: "daily-morning-workout",
    title: "Morning Workout",
    description: "Move your body before the day steals your attention.",
    kind: "daily",
    status: "active",
    difficulty: "easy",
    attributes: [{ key: "strength", weight: 1 }],
    xpReward: 40,
    coinReward: 8,
    gemReward: 0,
    missedPenaltyXp: 15,
    streakBonusEvery: 7,
    streakBonusXp: 25,
    isDefault: true,
  },
  {
    id: "daily-read-pages",
    title: "Read 20 Pages",
    description: "Train your mind with a focused reading block.",
    kind: "daily",
    status: "active",
    difficulty: "medium",
    attributes: [
      { key: "intelligence", weight: 0.75 },
      { key: "wisdom", weight: 0.25 },
    ],
    xpReward: 45,
    coinReward: 0,
    gemReward: 1,
    missedPenaltyXp: 15,
    streakBonusEvery: 7,
    streakBonusXp: 25,
    isDefault: true,
  },
  {
    id: "daily-no-sugar",
    title: "No Sugar Day",
    description: "Protect your discipline with one clean day.",
    kind: "daily",
    status: "active",
    difficulty: "medium",
    attributes: [{ key: "discipline", weight: 1 }],
    xpReward: 40,
    coinReward: 6,
    gemReward: 0,
    missedPenaltyXp: 15,
    streakBonusEvery: 7,
    streakBonusXp: 25,
    isDefault: true,
  },
  {
    id: "daily-save-money",
    title: "Save $20",
    description: "Put money aside instead of spending on impulse.",
    kind: "daily",
    status: "active",
    difficulty: "easy",
    attributes: [{ key: "finance", weight: 1 }],
    xpReward: 35,
    coinReward: 12,
    gemReward: 0,
    missedPenaltyXp: 12,
    streakBonusEvery: 7,
    streakBonusXp: 20,
    isDefault: true,
  },
  {
    id: "boss-inner-procrastination",
    title: "Inner Procrastination",
    description: "Defeat the boss that holds you back.",
    kind: "boss",
    status: "active",
    difficulty: "boss",
    attributes: [
      { key: "discipline", weight: 0.5 },
      { key: "wisdom", weight: 0.3 },
      { key: "communication", weight: 0.2 },
    ],
    xpReward: 650,
    coinReward: 120,
    gemReward: 3,
    deadline: undefined,
    missedPenaltyXp: 250,
    isDefault: true,
  },
];

export const defaultRewards: Array<
  Omit<StoreReward, "createdAt" | "updatedAt">
> = [
  {
    id: "reward-movie-night",
    title: "Movie Night",
    description: "A guilt-free movie and chill night.",
    kind: "experience",
    cost: 18,
    currency: "gems",
    isDefault: true,
    isArchived: false,
  },
  {
    id: "reward-cheat-meal",
    title: "Cheat Meal",
    description: "Enjoy your favorite meal.",
    kind: "experience",
    cost: 14,
    currency: "gems",
    isDefault: true,
    isArchived: false,
  },
  {
    id: "reward-new-shoes",
    title: "New Shoes",
    description: "Real-world gear bought with earned coins.",
    kind: "physical",
    cost: 2400,
    currency: "coins",
    isDefault: true,
    isArchived: false,
  },
  {
    id: "reward-gym-gear",
    title: "Gym Gear",
    description: "Upgrade the equipment that supports your discipline.",
    kind: "physical",
    cost: 3200,
    currency: "coins",
    isDefault: true,
    isArchived: false,
  },
];

export const defaultAchievements: Array<
  Omit<AchievementDefinition, "createdAt" | "updatedAt">
> = [
  {
    id: "achievement-level-25",
    key: "level-25",
    title: "Awakened Hunter",
    description: "Reach overall level 25.",
    category: "medal",
    metric: "overall-level",
    target: 25,
    medalImage: "/images/medals/star-shield-medal.png",
    coinReward: 250,
    gemReward: 3,
    isDefault: true,
  },
  {
    id: "achievement-streak-100",
    key: "streak-100",
    title: "Unbroken Flame",
    description: "Keep a 100 day streak.",
    category: "achievement",
    metric: "current-streak",
    target: 100,
    medalImage: "/images/medals/phoenix-crest-medal.png",
    coinReward: 1000,
    gemReward: 10,
    isDefault: true,
  },
  {
    id: "achievement-boss-20",
    key: "boss-20",
    title: "Boss Breaker",
    description: "Complete 20 boss quests.",
    category: "boss-trophy",
    metric: "bosses-completed",
    target: 20,
    medalImage: "/images/medals/lion-crest-medal.png",
    coinReward: 1500,
    gemReward: 15,
    isDefault: true,
  },
  {
    id: "achievement-perfect-year",
    key: "perfect-year",
    title: "Legendary Year",
    description: "Reach level 100 with no XP loss.",
    category: "title",
    metric: "no-xp-loss-year",
    target: 100,
    medalImage: "/images/medals/silver-guardian-medal.png",
    coinReward: 5000,
    gemReward: 50,
    isDefault: true,
  },
];

export function withTimestamps<T extends { id: string }>(
  entity: T,
): T & { createdAt: string; updatedAt: string } {
  const timestamp = now();
  return {
    ...entity,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
