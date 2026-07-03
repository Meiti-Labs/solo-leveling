export const MAX_LEVEL = 100;

// thresholds[i] = minimum XP required for level (i + 1)
// level 1 starts at 0 XP, level 2 at 100 XP, etc.
export const LEVEL_THRESHOLDS = Array.from({ length: MAX_LEVEL }, (_, i) => 50 * i * (i + 1));

/** Convert XP to level using the thresholds (binary search). */
export function xpToLevel(xp: number): number {
  const x = Math.max(0, xp);
  let lo = 0, hi = LEVEL_THRESHOLDS.length - 1, ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (x >= LEVEL_THRESHOLDS[mid]) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return Math.min(ans + 1, MAX_LEVEL);
}

/** Optional: closed-form version (same curve), clamped to 1..MAX_LEVEL. */
export function xpToLevelFast(xp: number): number {
  const x = Math.max(0, xp);
  // Solve 50 * L*(L-1) <= x  →  L = floor((1 + sqrt(1 + 0.08x)) / 2)
  const L = Math.floor((1 + Math.sqrt(1 + 0.08 * x)) / 2);
  return Math.min(Math.max(L, 1), MAX_LEVEL);
}
