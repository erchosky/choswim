export function getAccountLevel(xp: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1);
  const currentLevelMinXP = Math.pow(level - 1, 2) * 120;
  const nextLevelXP = Math.pow(level, 2) * 120;
  const progressPercent = Math.min(100, Math.round(((xp - currentLevelMinXP) / (nextLevelXP - currentLevelMinXP)) * 100));

  return {
    level,
    currentLevelMinXP,
    nextLevelXP,
    progressPercent
  };
}
