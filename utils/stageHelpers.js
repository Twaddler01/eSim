export function getItemMax(item, stageProgress) {

    const baseMax = item.max;
    
    // No max = unlimited
    if (baseMax == null) {
        return null;
    }

    const upgrade =
        item.gather?.upgrade;

    if (!upgrade?.enabled) {
        return baseMax;
    }

    const level =
        stageProgress.getGatherLevel(item.id);

    return (
        baseMax +
        level * upgrade.maxIncrease
    );
}