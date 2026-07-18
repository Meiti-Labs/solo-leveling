import type {
  AchievementDefinition,
  AttributeProgress,
  StoreReward,
  TaskDefinition,
} from "@/lib/indexed-db/types";

const now = () => new Date().toISOString();

type SeedLanguage = "en" | "fa";

export const defaultAttributes: Array<
  Pick<
    AttributeProgress,
    "colorScheme" | "icon" | "id" | "isDefault" | "key" | "label" | "xp"
  >
> = [
  {
    id: "attribute-strength",
    key: "strength",
    label: "Strength",
    xp: 0,
    isDefault: true,
    colorScheme: "purple",
    icon: "sword",
  },
  {
    id: "attribute-intelligence",
    key: "intelligence",
    label: "Intelligence",
    xp: 0,
    isDefault: true,
    colorScheme: "blue",
    icon: "book-open",
  },
  {
    id: "attribute-discipline",
    key: "discipline",
    label: "Discipline",
    xp: 0,
    isDefault: true,
    colorScheme: "green",
    icon: "shield",
  },
  {
    id: "attribute-finance",
    key: "finance",
    label: "Finance",
    xp: 0,
    isDefault: true,
    colorScheme: "gold",
    icon: "coins",
  },
  {
    id: "attribute-wisdom",
    key: "wisdom",
    label: "Wisdom",
    xp: 0,
    isDefault: true,
    colorScheme: "cyan",
    icon: "flame",
  },
  {
    id: "attribute-communication",
    key: "communication",
    label: "Communication",
    xp: 0,
    isDefault: true,
    colorScheme: "pink",
    icon: "message-square",
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

const localizedSeedText: Record<SeedLanguage, Record<string, string>> = {
  en: {},
  fa: {
    "A guilt-free movie and chill night.": "یک شب فیلم و آرامش بدون عذاب وجدان.",
    "Awakened Hunter": "شکارچی بیدارشده",
    "Boss Breaker": "شکننده باس",
    "Cheat Meal": "وعده آزاد",
    "Communication": "ارتباطات",
    "Complete 20 boss quests.": "۲۰ ماموریت باس را کامل کن.",
    "Defeat the boss that holds you back.": "باسی را شکست بده که عقب نگهت داشته.",
    "Discipline": "نظم",
    "Enjoy your favorite meal.": "غذای محبوبت را با خیال راحت بخور.",
    "Finance": "مالی",
    "Gym Gear": "وسایل باشگاه",
    "Inner Procrastination": "اهمال‌کاری درونی",
    "Intelligence": "هوش",
    "Keep a 100 day streak.": "یک رشته ۱۰۰ روزه را حفظ کن.",
    "Legendary Year": "سال افسانه‌ای",
    "Morning Workout": "تمرین صبحگاهی",
    "Move your body before the day steals your attention.": "قبل از اینکه روز تمرکزت را بدزدد، بدنت را حرکت بده.",
    "Movie Night": "شب فیلم",
    "New Shoes": "کفش نو",
    "No Sugar Day": "روز بدون شکر",
    "Protect your discipline with one clean day.": "با یک روز پاک، نظمت را حفظ کن.",
    "Put money aside instead of spending on impulse.": "به‌جای خرج ناگهانی، پول کنار بگذار.",
    "Reach level 100 with no XP loss.": "بدون از دست دادن XP به سطح ۱۰۰ برس.",
    "Reach overall level 25.": "به سطح کلی ۲۵ برس.",
    "Read 20 Pages": "مطالعه ۲۰ صفحه",
    "Real-world gear bought with earned coins.": "وسیله واقعی که با سکه‌های کسب‌شده خریده می‌شود.",
    "Save $20": "پس‌انداز ۲۰ دلار",
    "Strength": "قدرت",
    "Train your mind with a focused reading block.": "ذهنت را با یک بازه مطالعه متمرکز تمرین بده.",
    "Unbroken Flame": "شعله نشکسته",
    "Upgrade the equipment that supports your discipline.": "تجهیزاتی را ارتقا بده که از نظمت پشتیبانی می‌کند.",
    "Wisdom": "خرد",
  },
};

export function getSeedData(language?: string) {
  const seedLanguage = resolveSeedLanguage(language);

  return {
    defaultAchievements: defaultAchievements.map((achievement) => ({
      ...achievement,
      description: translateRequiredSeedText(
        achievement.description,
        seedLanguage,
      ),
      title: translateRequiredSeedText(achievement.title, seedLanguage),
    })),
    defaultAttributes: defaultAttributes.map((attribute) => ({
      ...attribute,
      label: translateRequiredSeedText(attribute.label, seedLanguage),
    })),
    defaultRewards: defaultRewards.map((reward) => ({
      ...reward,
      description: translateSeedText(reward.description, seedLanguage),
      title: translateRequiredSeedText(reward.title, seedLanguage),
    })),
    defaultTasks: defaultTasks.map((task) => ({
      ...task,
      description: translateSeedText(task.description, seedLanguage),
      title: translateRequiredSeedText(task.title, seedLanguage),
    })),
  };
}

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

function resolveSeedLanguage(language?: string): SeedLanguage {
  return language === "fa" ? "fa" : "en";
}

function translateSeedText(value: string | undefined, language: SeedLanguage) {
  if (!value || language === "en") {
    return value;
  }

  return localizedSeedText[language][value] ?? value;
}

function translateRequiredSeedText(value: string, language: SeedLanguage) {
  return translateSeedText(value, language) ?? value;
}
