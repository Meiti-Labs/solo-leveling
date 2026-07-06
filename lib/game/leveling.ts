export type LevelProgress = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
};

export const MAX_LEGENDARY_LEVEL = 100;

export function xpRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(240 + 1.6 * safeLevel ** 1.45);
}

export function totalXpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  let total = 0;

  for (let currentLevel = 1; currentLevel < safeLevel; currentLevel += 1) {
    total += xpRequiredForNextLevel(currentLevel);
  }

  return total;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remainingXp = safeXp;

  while (
    level < MAX_LEGENDARY_LEVEL &&
    remainingXp >= xpRequiredForNextLevel(level)
  ) {
    remainingXp -= xpRequiredForNextLevel(level);
    level += 1;
  }

  const xpForNextLevel =
    level >= MAX_LEGENDARY_LEVEL ? 0 : xpRequiredForNextLevel(level);

  return {
    level,
    totalXp: safeXp,
    xpIntoLevel: level >= MAX_LEGENDARY_LEVEL ? 0 : remainingXp,
    xpForNextLevel,
    progressPercent:
      level >= MAX_LEGENDARY_LEVEL || xpForNextLevel === 0
        ? 100
        : Math.round((remainingXp / xpForNextLevel) * 100),
  };
}
