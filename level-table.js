/**
 * @file Defines the level progression table and helper functions.
 */

export const LEVEL_TABLE = [
  // index 0 -> level1
  0,
  100, 200, 350, 550, 800, 1100, 1450, 1850, 2300,
  2800, 3350, 3950, 4600, 5300, 6050, 6850, 7700, 8600, 9550,
  10550, 11600, 12700, 13850, 15050, 16300, 17600, 18950, 20350, 21800
];

/**
 * Returns required exp to reach the next level.
 * @param {number} level - Current level (1-indexed)
 */
export function expToNextLevel(level) {
  if (level < 1) level = 1;
  if (level >= LEVEL_TABLE.length) return Infinity;
  return LEVEL_TABLE[level];
}

/**
 * Increases max stats on level up.
 * Currently +5 max health & mental per level.
 * @param {object} stats - stats object reference
 */
export function applyLevelUpStats(stats) {
  stats.health.max += 5;
  stats.mental.max += 5;
  // ensure current does not exceed new max
  stats.health.current = Math.min(stats.health.current, stats.health.max);
  stats.mental.current = Math.min(stats.mental.current, stats.mental.max);
} 