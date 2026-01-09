export const LEVEL_THRESHOLDS = [
    { level: 1, minPoints: 0, maxPoints: 500 },
    { level: 2, minPoints: 501, maxPoints: 1200 },
    { level: 3, minPoints: 1201, maxPoints: 2500 },
    { level: 4, minPoints: 2501, maxPoints: 5000 },
    { level: 5, minPoints: 5001, maxPoints: 10000 },
];

export function calculateLevel(points: number): number {
    for (const threshold of LEVEL_THRESHOLDS) {
        if (points >= threshold.minPoints && points <= threshold.maxPoints) {
            return threshold.level;
        }
    }

    // Cap at max level if points exceed last threshold
    const maxFunctionLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;
    if (points > LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].maxPoints) {
        // Dynamic formula for infinite scaling beyond fixed levels if needed
        // For now, let's just return the max defined + every 5000 points
        const extraPoints = points - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].maxPoints;
        const extraLevels = Math.floor(extraPoints / 5000);
        return maxFunctionLevel + extraLevels;
    }

    return 1;
}

export function getLevelProgress(points: number): number {
    const level = calculateLevel(points);
    const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level);

    // Handle dynamic high levels simplistically
    if (!currentThreshold) return 100;

    const range = currentThreshold.maxPoints - currentThreshold.minPoints;
    const progress = points - currentThreshold.minPoints;

    return Math.min(100, Math.max(0, Math.floor((progress / range) * 100)));
}
